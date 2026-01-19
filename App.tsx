import React, { useState } from 'react';
import { AppView, MedicineDetails } from './types';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import MedicineDetailsView from './components/MedicineDetailsView';
import ChatBot from './components/ChatBot';
import LiveAssistant from './components/LiveAssistant';
import HospitalFinder from './components/HospitalFinder';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [scannedData, setScannedData] = useState<MedicineDetails | null>(null);

  const handleScanComplete = (details: MedicineDetails) => {
    setScannedData(details);
    // Note: We don't have a specific DETAILS enum view in AppView for simplicity in types, 
    // but effectively we render Details component if data is present and we were in scanner.
    // Let's toggle a separate boolean or just use logic in render.
  };

  const handleBackToDashboard = () => {
    setScannedData(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    if (scannedData) {
      return <MedicineDetailsView data={scannedData} onBack={handleBackToDashboard} />;
    }

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.SCANNER:
        return <Scanner onScanComplete={handleScanComplete} />;
      case AppView.CHAT:
        return <ChatBot />;
      case AppView.LIVE:
        return <LiveAssistant />;
      case AppView.MAPS:
        return <HospitalFinder />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="bg-medicinal-bg text-slate-200 min-h-screen font-sans selection:bg-neon-blue/30 selection:text-white flex flex-col">
      <main className="flex-1 pb-24 relative max-w-lg mx-auto w-full shadow-2xl bg-black min-h-screen">
         {/* Top decorative gradient */}
         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-neon-blue/10 to-transparent pointer-events-none" />
         
         {renderContent()}
      </main>
      
      <Navbar currentView={currentView} onChangeView={(view) => {
        setScannedData(null); // Reset scan details when changing tabs
        setCurrentView(view);
      }} />
    </div>
  );
};

export default App;
