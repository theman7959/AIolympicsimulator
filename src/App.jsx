import React, { useState, useEffect } from 'react';

export default function OlympicSim() {
  const [allCountries, setAllCountries] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPodium, setShowPodium] = useState(false);

  // 1. Fetch all 193+ Countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca3,continents')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.cca3,
          name: c.name.common,
          flag: c.flags.png,
          region: c.continents[0]
        })).sort((a, b) => a.name.localeCompare(b.name));
        setAllCountries(formatted);
      });
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    setShowPodium(false);
    
    setTimeout(() => {
      const heat = selected.map(c => ({
        ...c,
        athlete: `AI Athlete ${Math.floor(Math.random() * 99)}`,
        time: (9.5 + Math.random() * 2).toFixed(2)
      })).sort((a, b) => a.time - b.time);

      setResults(heat);
      setIsSimulating(false);
      setShowPodium(true);
      
      // 2. Play National Anthem (Announcement)
      const announcement = new SpeechSynthesisUtterance(
        `Gold medal goes to ${heat[0].name}. Playing the national anthem.`
      );
      window.speechSynthesis.speak(announcement);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Search & Select */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-center text-yellow-500">AI GLOBAL GAMES</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 max-h-48 overflow-y-auto p-4 bg-slate-800 rounded">
          {allCountries.map(c => (
            <button 
              key={c.id} 
              onClick={() => selected.length < 8 && setSelected([...selected, c])}
              className={`p-2 text-xs flex items-center gap-2 border rounded ${selected.includes(c) ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <img src={c.flag} className="w-6 h-4 object-cover" alt="flag" /> {c.name}
            </button>
          ))}
        </div>

        <button 
          disabled={selected.length !== 8} 
          onClick={runSimulation}
          className="w-full py-4 bg-yellow-500 text-black font-bold rounded-full mb-12 disabled:opacity-50"
        >
          {isSimulating ? "RACING..." : "START EVENT"}
        </button>

        {/* 3. Victory Podium Visual */}
        {showPodium && results.length > 0 && (
          <div className="flex flex-col items-center animate-bounce-in">
            <h2 className="text-2xl font-bold mb-10">VICTORY CEREMONY</h2>
            <div className="flex items-end gap-2 h-64">
              {/* Silver */}
              <div className="flex flex-col items-center">
                <img src={results[1].flag} className="w-12 border-2 border-white mb-2" />
                <div className="w-24 h-32 bg-slate-400 flex items-center justify-center font-bold text-2xl">2</div>
                <p className="text-xs mt-2">{results[1].id}</p>
              </div>
              {/* Gold */}
              <div className="flex flex-col items-center">
                <img src={results[0].flag} className="w-16 border-4 border-yellow-500 mb-2 animate-pulse" />
                <div className="w-28 h-48 bg-yellow-500 flex flex-col items-center justify-center font-bold text-4xl text-slate-900">
                  <span>1</span>
                  <span className="text-xs uppercase mt-2">Champion</span>
                </div>
                <p className="font-bold mt-2 text-yellow-500 italic">Anthem Playing...</p>
              </div>
              {/* Bronze */}
              <div className="flex flex-col items-center">
                <img src={results[2].flag} className="w-12 border-2 border-white mb-2" />
                <div className="w-24 h-24 bg-orange-700 flex items-center justify-center font-bold text-2xl">3</div>
                <p className="text-xs mt-2">{results[2].id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
