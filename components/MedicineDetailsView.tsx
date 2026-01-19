import React from 'react';
import { MedicineDetails } from '../types';
import { ShieldAlert, Activity, Clock, FileText, ChevronLeft } from 'lucide-react';

interface Props {
  data: MedicineDetails;
  onBack: () => void;
}

const MedicineDetailsView: React.FC<Props> = ({ data, onBack }) => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors">
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-neon-blue/20 to-purple-500/20 p-8 border-b border-white/5">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-4xl font-bold text-white mb-2">{data.name}</h1>
                <p className="text-xl text-neon-blue font-mono">{data.genericName}</p>
             </div>
             {data.confidenceScore && (
                 <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase tracking-wider">AI Confidence</div>
                    <div className="text-2xl font-bold text-neon-emerald">{(data.confidenceScore * 100).toFixed(0)}%</div>
                 </div>
             )}
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
               <div className="flex items-center gap-3 mb-4 text-neon-purple">
                  <Activity />
                  <h3 className="text-lg font-bold">Purpose & Usage</h3>
               </div>
               <p className="text-slate-300 leading-relaxed">{data.purpose}</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
               <div className="flex items-center gap-3 mb-4 text-neon-blue">
                  <Clock />
                  <h3 className="text-lg font-bold">Dosage Guidance</h3>
               </div>
               <p className="text-slate-300 leading-relaxed">{data.dosage}</p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
               <div className="flex items-center gap-3 mb-4 text-red-400">
                  <ShieldAlert />
                  <h3 className="text-lg font-bold">Warnings & Side Effects</h3>
               </div>
               <ul className="list-disc list-inside space-y-2 text-slate-300">
                  {data.warnings.map((w, i) => <li key={i} className="text-red-200/80">{w}</li>)}
                  {data.sideEffects.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
               </ul>
            </div>
            
            {data.manufacturer && (
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
                   <div className="flex items-center gap-3 text-slate-400">
                      <FileText size={20} />
                      <span>Manufacturer</span>
                   </div>
                   <span className="font-bold text-white">{data.manufacturer}</span>
                </div>
            )}
          </div>
        
        </div>
        
        <div className="p-4 bg-slate-950/50 text-center text-xs text-slate-600">
           Disclaimer: AI-generated information. Always consult a real doctor before taking medication.
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailsView;
