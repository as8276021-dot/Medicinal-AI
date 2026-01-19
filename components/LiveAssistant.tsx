import React, { useEffect, useRef, useState } from 'react';
import { connectLiveSession } from '../services/geminiService';
import { Mic, MicOff, Volume2, Waveform } from 'lucide-react';

const LiveAssistant: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = () => {
    if (sessionRef.current) {
        // There is no explicit .close() on the session object in some versions, 
        // but often the client or socket needs closing. 
        // For the provided SDK snippet, we assume session is the object we interact with but the connection logic returned a promise.
        // We will just reset state here as the API doesn't expose a clear imperative close on the session object itself in the provided prompt snippet.
        // However, usually we should close the stream/context.
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
  };

  const startSession = async () => {
    setError(null);
    try {
      // Setup Audio Output
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputContext.createMediaStreamSource(stream);
      const processor = inputContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isConnected) return; // Guard
        const inputData = e.inputBuffer.getChannelData(0);
        // Create PCM Blob (simplified from prompt guidelines)
        const pcmData = createPCMData(inputData);
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (sessionRef.current) {
             sessionRef.current.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio
                }
             });
        }
      };

      source.connect(processor);
      processor.connect(inputContext.destination);

      // Connect to Gemini
      const sessionPromise = connectLiveSession(
        () => {
            console.log("Live Session Open");
            setIsConnected(true);
        },
        (base64Audio) => {
           playAudio(base64Audio);
           setIsTalking(true);
           // Simple timeout to toggle talking visual off
           setTimeout(() => setIsTalking(false), 500); 
        },
        () => {
            console.log("Live Session Closed");
            setIsConnected(false);
        }
      );

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone or connect to AI.");
    }
  };

  const createPCMData = (float32Array: Float32Array) => {
      const int16Array = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
          let s = Math.max(-1, Math.min(1, float32Array[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return int16Array;
  };

  const playAudio = async (base64String: string) => {
      if (!audioContextRef.current) return;
      
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
      }
      
      const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      const currentTime = audioContextRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime;
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Animation */}
       <div className={`absolute inset-0 bg-neon-emerald/5 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}></div>
       {isConnected && <div className="absolute w-[500px] h-[500px] bg-neon-emerald/20 blur-[100px] rounded-full animate-pulse-slow"></div>}

       <div className="z-10 flex flex-col items-center space-y-8">
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isConnected ? 'border-neon-emerald shadow-[0_0_50px_#10b981]' : 'border-slate-700 bg-slate-900'}`}>
              {isConnected ? (
                  <div className="flex gap-1 items-end h-16">
                      <div className="w-2 bg-neon-emerald animate-[bounce_1s_infinite] h-8"></div>
                      <div className="w-2 bg-neon-emerald animate-[bounce_1.2s_infinite] h-12"></div>
                      <div className="w-2 bg-neon-emerald animate-[bounce_0.8s_infinite] h-6"></div>
                      <div className="w-2 bg-neon-emerald animate-[bounce_1.1s_infinite] h-10"></div>
                  </div>
              ) : (
                  <MicOff className="text-slate-600 w-16 h-16" />
              )}
          </div>

          <div className="text-center space-y-2">
             <h2 className="text-3xl font-bold text-white">{isConnected ? 'Listening...' : 'Live Assistant'}</h2>
             <p className="text-slate-400">Gemini Live Native Audio • Hands-Free Mode</p>
          </div>

          {!isConnected ? (
              <button 
                onClick={startSession}
                className="bg-neon-emerald hover:bg-emerald-400 text-slate-950 font-bold py-4 px-10 rounded-full text-xl shadow-[0_0_20px_#10b981] transition-all flex items-center gap-2"
              >
                 <Mic /> Start Conversation
              </button>
          ) : (
              <button 
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all"
              >
                 End Session
              </button>
          )}

          {error && <p className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}
       </div>
    </div>
  );
};

export default LiveAssistant;
