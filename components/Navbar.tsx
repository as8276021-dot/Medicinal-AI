import React from 'react';
import { AppView } from '../types';
import { Home, Camera, MessageSquare, Mic, Map } from 'lucide-react';

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Navbar: React.FC<Props> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Home' },
    { view: AppView.SCANNER, icon: Camera, label: 'Scan' },
    { view: AppView.LIVE, icon: Mic, label: 'Live' },
    { view: AppView.CHAT, icon: MessageSquare, label: 'Chat' },
    { view: AppView.MAPS, icon: Map, label: 'Find' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 pb-safe pt-2 px-6 flex justify-between items-end z-50 h-20">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        return (
          <button
            key={item.label}
            onClick={() => onChangeView(item.view)}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-neon-blue -translate-y-2' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-neon-blue/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}`}>
               <item.icon size={24} />
            </div>
            <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Navbar;
