import React, { useState, useRef, useEffect } from 'react';
import { chatWithDoctor, searchMedicineUpdates } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, BrainCircuit, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hello. I am your Medicinal AI assistant. Ask me about any medicine, side effects, or interactions.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      
      if (useSearch) {
        // Search Grounding Flow
        const searchResult = await searchMedicineUpdates(userMsg.text);
        responseText = `**Search Results:**\n\n${searchResult.text}\n\n` + 
                       (searchResult.sources.length > 0 ? "**Sources:**\n" + searchResult.sources.map(s => `- [${s.web?.title}](${s.web?.uri})`).join('\n') : "");
      } else {
        // Standard Chat Flow (Thinking optional)
        // Convert internal message format to API history format
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const stream = await chatWithDoctor(history, userMsg.text, useThinking);
        
        for await (const chunk of stream) {
            responseText = chunk.text || ""; // Accumulate or replace depending on your stream handling preference, usually chunk.text is the delta or full.
            // Note: generateContentStream accumulates by default in the SDK object but chunk is usually a part.
            // However, chat.sendMessageStream typically yields chunks.
            // For simplicity in this demo, let's assume we build it up or just wait for full if complex.
            // But let's act like we are appending for better UX.
            // Actually, the new SDK `chunk.text` is the text of that chunk.
        }
        // Since the stream loop above doesn't easily allow updating state rapidly without jitter in this simple setup,
        // let's grab the accumulated response if possible, or just build a string locally and set it at end.
        // Re-fetching full text for simplicity:
        // A better pattern for stream:
        let fullText = "";
        const tempId = (Date.now() + 1).toString();
        
        // Initial placeholder
        setMessages(prev => [...prev, { id: tempId, role: 'model', text: '...', timestamp: Date.now(), isThinking: useThinking }]);

        const stream2 = await chatWithDoctor(history, userMsg.text, useThinking);
        for await (const chunk of stream2) {
           if (chunk.text) {
             fullText += chunk.text;
             setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: fullText, isThinking: false } : m));
           }
        }
        return; // Exit here as we handled the state update in the loop
      }

      // Fallback for search (non-stream)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() }]);

    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "I encountered an error processing your request.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between glass-panel sticky top-0 z-10">
        <div className="flex items-center gap-2 text-white font-bold">
           <Bot className="text-neon-purple" /> AI Personal Doctor
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setUseThinking(!useThinking); setUseSearch(false); }}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${useThinking ? 'bg-neon-purple text-white shadow-[0_0_10px_#8b5cf6]' : 'bg-slate-800 text-slate-400'}`}
          >
            <BrainCircuit size={14} />
            Deep Think
          </button>
          <button 
             onClick={() => { setUseSearch(!useSearch); setUseThinking(false); }}
             className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${useSearch ? 'bg-blue-500 text-white shadow-[0_0_10px_#3b82f6]' : 'bg-slate-800 text-slate-400'}`}
          >
             <Globe size={14} />
             Search
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-neon-blue/10 border border-neon-blue/30 text-slate-100 rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
            }`}>
              {msg.isThinking && (
                 <div className="flex items-center gap-2 text-neon-purple text-xs mb-2 animate-pulse">
                    <BrainCircuit size={12} /> Thinking Process Active...
                 </div>
              )}
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-panel border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a medicine..."
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-neon-blue text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
