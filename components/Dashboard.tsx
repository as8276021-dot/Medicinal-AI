import React from 'react';
import { Camera, MessageSquare, Mic, MapPin, History, Activity } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
          Medicinal AI
        </h1>
        <p className="text-slate-400 text-lg">Your intelligent health companion.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Main Action - Scan */}
        <button 
          onClick={() => onChangeView(AppView.SCANNER)}
          className="col-span-2 md:col-span-2 aspect-[2/1] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-neon-blue/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all group relative overflow-hidden flex flex-col justify-center items-start p-6"
        >
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <Camera size={80} />
          </div>
          <div className="bg-neon-blue/20 p-3 rounded-full mb-3 text-neon-blue">
            <Camera size={24} />
          </div>
          <span className="text-2xl font-bold text-white group-hover:text-neon-blue transition-colors">Scan Medicine</span>
          <span className="text-sm text-slate-400 mt-1">Nano Banana Enhanced • Deep Analysis</span>
        </button>

        {/* Live Assistant */}
        <button 
          onClick={() => onChangeView(AppView.LIVE)}
          className="aspect-square glass-panel rounded-2xl hover:bg-slate-800/50 transition-all flex flex-col justify-center items-center p-4 border-t border-neon-emerald/20 group"
        >
          <div className="bg-neon-emerald/20 p-4 rounded-full mb-3 text-neon-emerald group-hover:scale-110 transition-transform">
            <Mic size={24} />
          </div>
          <span className="font-semibold text-slate-200">Live Doctor</span>
          <span className="text-xs text-slate-500 mt-1">Real-time Voice</span>
        </button>

        {/* AI Chat */}
        <button 
          onClick={() => onChangeView(AppView.CHAT)}
          className="aspect-square glass-panel rounded-2xl hover:bg-slate-800/50 transition-all flex flex-col justify-center items-center p-4 border-t border-neon-purple/20 group"
        >
          <div className="bg-neon-purple/20 p-4 rounded-full mb-3 text-neon-purple group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <span className="font-semibold text-slate-200">AI Chat</span>
          <span className="text-xs text-slate-500 mt-1">Thinking Model</span>
        </button>

        {/* Maps */}
        <button 
          onClick={() => onChangeView(AppView.MAPS)}
          className="aspect-square glass-panel rounded-2xl hover:bg-slate-800/50 transition-all flex flex-col justify-center items-center p-4 border-t border-orange-500/20 group"
        >
          <div className="bg-orange-500/20 p-4 rounded-full mb-3 text-orange-500 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          <span className="font-semibold text-slate-200">Find Clinic</span>
          <span className="text-xs text-slate-500 mt-1">Maps Grounding</span>
        </button>
        
        {/* History */}
        <button 
           onClick={() => onChangeView(AppView.HISTORY)}
           className="aspect-square glass-panel rounded-2xl hover:bg-slate-800/50 transition-all flex flex-col justify-center items-center p-4 border-t border-slate-500/20 group"
        >
           <div className="bg-slate-700/50 p-4 rounded-full mb-3 text-slate-300 group-hover:scale-110 transition-transform">
            <History size={24} />
          </div>
           <span className="font-semibold text-slate-200">History</span>
        </button>

      </div>
      
      {/* Status Card */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Activity className="text-neon-emerald animate-pulse" />
            <div>
               <div className="text-sm font-bold text-white">System Operational</div>
               <div className="text-xs text-slate-500">Gemini 3 Pro + Nano Banana Active</div>
            </div>
         </div>
         <div className="h-2 w-2 rounded-full bg-neon-emerald shadow-[0_0_10px_#10b981]"></div>
      </div>
    </div>
  );
};

export default Dashboard;
