import React, { useState } from 'react';
import { findNearbyMedical } from '../services/geminiService';
import { MapPin, Navigation, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const HospitalFinder: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleFind = (type: 'hospital' | 'pharmacy') => {
    setLoading(true);
    setResult(null);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await findNearbyMedical(latitude, longitude, type);
          setResult(data.text);
        } catch (err) {
          setLocationError("Failed to fetch location data.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="h-full p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
             <MapPin className="text-orange-500" /> Nearby Care Finder
          </h2>
          <p className="text-slate-400">Locate rated hospitals & pharmacies using Google Maps Intelligence.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleFind('hospital')}
            disabled={loading}
            className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-orange-500/50 hover:bg-slate-800 transition-all flex flex-col items-center gap-2 group"
          >
             <div className="bg-orange-500/10 p-3 rounded-full text-orange-500 group-hover:scale-110 transition-transform">
               <ActivityIcon />
             </div>
             <span className="font-bold text-slate-200">Find Hospitals</span>
          </button>
          
           <button 
            onClick={() => handleFind('pharmacy')}
            disabled={loading}
            className="p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-green-500/50 hover:bg-slate-800 transition-all flex flex-col items-center gap-2 group"
          >
             <div className="bg-green-500/10 p-3 rounded-full text-green-500 group-hover:scale-110 transition-transform">
               <PlusIcon />
             </div>
             <span className="font-bold text-slate-200">Find Pharmacies</span>
          </button>
        </div>

        {loading && (
          <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-orange-500">Scanning Maps Data...</p>
          </div>
        )}

        {locationError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center">
            {locationError}
          </div>
        )}

        {result && (
          <div className="glass-panel p-6 rounded-xl border border-slate-700 animate-fade-in-up">
            <div className="prose prose-invert prose-sm max-w-none">
               <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
               <span>Powered by Google Maps Grounding</span>
               <Navigation size={14} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default HospitalFinder;
