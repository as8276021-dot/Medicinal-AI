import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MedicineDetails, MapPlace, GroundingChunk } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Vision Analysis ---
export const analyzeMedicineImage = async (base64Image: string): Promise<MedicineDetails> => {
  const ai = getClient();
  
  // Using gemini-3-pro-preview for Deep Image Analysis Engine
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    Analyze this medicine image carefully. Act as a professional pharmacist.
    Extract the following details:
    - Brand Name
    - Generic Name / Composition
    - Purpose (What is it used for?)
    - General Dosage Instructions (if visible or standard knowledge)
    - Key Side Effects (Common)
    - Warnings & Precautions
    - Manufacturer (if visible)
    - Expiry Date (if visible)
    
    If text is blurry, infer from distinct packaging features if possible, but mark confidence lower.
    Return the result as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            genericName: { type: Type.STRING },
            purpose: { type: Type.STRING },
            dosage: { type: Type.STRING },
            sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            manufacturer: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["name", "purpose", "sideEffects", "warnings"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as MedicineDetails;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- Chat Doctor ---
export const chatWithDoctor = async (history: {role: string, parts: {text: string}[]}[], message: string, useThinking: boolean = false) => {
  const ai = getClient();
  const modelId = "gemini-3-pro-preview"; // Best for complex medical reasoning

  const config: any = {
    systemInstruction: "You are Medicinal AI, a professional, safe, and helpful AI Doctor assistant. You do not provide diagnosis, but you explain medicines, interactions, and general health advice clearly. Always include a disclaimer for serious symptoms.",
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 2048 }; // Allocate thinking budget for complex queries
  }

  const chat = ai.chats.create({
    model: modelId,
    history: history,
    config: config
  });

  const response = await chat.sendMessageStream({ message });
  return response;
};

// --- Search Grounding ---
export const searchMedicineUpdates = async (query: string): Promise<{text: string, sources: GroundingChunk[]}> => {
  const ai = getClient();
  const modelId = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return {
    text: response.text || "No information found.",
    sources: chunks as GroundingChunk[]
  };
};

// --- Maps Grounding ---
export const findNearbyMedical = async (lat: number, lng: number, type: 'hospital' | 'pharmacy'): Promise<{text: string, places: MapPlace[]}> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash"; // Required for Maps

  const prompt = `Find the best 5 ${type}s near me. Rank them by rating and distance. Provide a summary list.`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    }
  });

  // Extract structured place data if available in grounding chunks
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const places: MapPlace[] = [];
  
  // Note: Grounding chunks for maps often contain direct web URIs or title. 
  // We'll parse the text for better display or just use the text returned by the model which is usually markdown formatted with links.
  
  return {
    text: response.text || "Could not find locations.",
    places: [] // We will rely on the markdown text containing links for this demo as parsing complex grounding chunks can be varied.
  };
};

// --- Live API ---
export const connectLiveSession = async (
    onOpen: () => void,
    onAudioData: (base64: string) => void,
    onClose: () => void
): Promise<any> => {
    const ai = getClient();
    const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
            onopen: onOpen,
            onmessage: (msg) => {
                if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                    onAudioData(msg.serverContent.modelTurn.parts[0].inlineData.data);
                }
            },
            onclose: onClose,
            onerror: (err) => console.error("Live API Error:", err),
        },
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are Medicinal AI's Voice Assistant. Speak clearly, professionally, and concisely about medicine.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Deep, professional voice
            }
        }
    });
    return session;
}