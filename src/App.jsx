import React, { useState, useEffect } from 'react';

// AI Name Components by Linguistic Region
const NAME_DATA = {
  western: { first: ["Jack", "Emma", "Liam", "Olivia", "Noah"], last: ["Smith", "Miller", "Taylor", "Jones"] },
  eastAsian: { first: ["Wei", "Min", "Hiro", "Yuki", "Jung"], last: ["Li", "Zhang", "Sato", "Suzuki", "Kim"] },
  hispanic: { first: ["Mateo", "Elena", "Diego", "Sofia", "Lucas"], last: ["Garcia", "Rodriguez", "Lopez", "Martinez"] },
  nordic: { first: ["Lars", "Astrid", "Erik", "Freja", "Sven"], last: ["Hansen", "Nielsen", "Olsen", "Lund"] },
  african: { first: ["Kofi", "Zuri", "Kwame", "Amara", "Juma"], last: ["Mensah", "Diallo", "Keita", "Toure"] }
};

const EVENTS = [
  { name: "100m Sprint", unit: "s", base: 9.5 },
  { name: "Long Jump", unit: "m", base: 8.2 },
  { name: "High Jump", unit: "m", base: 2.3 },
  { name: "Swimming 50m", unit: "s", base: 21.1 }
];

export default function OlympicSim() {
  const [allCountries, setAllCountries] = useState([]);
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [activeEvent, setActiveEvent] = useState(EVENTS[0]);
  const [results, setResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca3,continents')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.cca3,
          name: c.name.common,
          flag: c.flags.png,
          region: c.continents[0] === 'Europe' ? 'western' : (c.continents[0] === 'Asia' ? 'eastAsian' : 'western')
        })).sort((a, b) => a.name.localeCompare(b.name));
        setAllCountries(formatted);
      });
  }, []);

  const generateAIName = (country) => {
    const region = country.region || 'western';
    const bank = NAME_DATA[region] || NAME_DATA.western;
    const f = bank.first[Math.floor(Math.random() * bank.first.length)];
    const l = bank.last[Math.floor(Math.random() * bank.last.length)];
    return `${f} ${l}`;
  };

  const addAthlete = (country) => {
    if (selectedAthletes.length < 8) {
      const newAthlete = {
        ...country,
        athleteName: generateAIName(country),
        uid: Math.random().toString(36).substr(2, 9) // Unique ID for same-country athletes
      };
      setSelectedAthletes([...selectedAthletes, newAthlete]);
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setResults([]);
    
    setTimeout(() => {
      const heat = selectedAthletes.map(a => ({
        ...a,
        performance: (activeEvent.base + Math.random() * 2).toFixed(2)
      })).sort((a, b) => a.performance - b.performance);

      setResults(heat);
      setIsSimulating(false);
      
      // Visual Fanfare Trigger
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'); 
      audio.play().catch(() => console.log("Audio blocked by browser - click anywhere first!"));
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-10 text-yellow-400 italic">AI OLYMPIC ARENA</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Config */}
          <div className="space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select Event</label>
              <select onChange={(e) => setActiveEvent(EVENTS[e.target.selectedIndex])} className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700">
                {EVENTS.map(e => <option key={e.name}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select Countries (Up to 8)</label>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto scrollbar-hide">
                {allCountries.map(c => (
                  <button key={c.id} onClick={() => addAthlete(c)} className="text-left text-xs bg-slate-800 p-2 rounded hover:bg-slate-700 flex items-center gap-2">
                    <img src={c.flag} className="w-5 h-3 object-cover" /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: The Lane / Track */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 min-h-[400px]">
              <h2 className="text-xl font-bold mb-4 border-b border-slate-800 pb-2">Entry List ({selectedAthletes.length}/8)</h2>
              <div className="space-y-2">
                {selectedAthletes.map((a, i) => (
                  <div key={a.uid} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg animate-slide-in">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">Lane {i+1}</span>
                      <img src={a.flag} className="w-6 h-4" />
                      <span className="font-bold">{a.athleteName}</span>
                    </div>
                    <button onClick={() => setSelectedAthletes(selectedAthletes.filter(x => x.uid !== a.uid))} className="text-red-500 text-xs">Remove</button>
                  </div>
                ))}
              </div>
              
              {selectedAthletes.length === 8 && (
                <button onClick={runSimulation} className="w-full mt-6 py-4 bg-yellow-500 text-black font-black rounded-xl hover:scale-[1.02] transition-transform">
                  {isSimulating ? "ATHLETES ARE SET..." : `RUN ${activeEvent.name.toUpperCase()}`}
                </button>
              )}
            </div>

            {/* Column 3: Podium (Appears after simulation) */}
            {results.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-2xl">
                <h2 className="text-center font-black text-2xl text-yellow-500 mb-8">VICTORY PODIUM</h2>
                <div className="flex justify-center items-end gap-2 h-48">
                   <PodiumSpot athlete={results[1]} rank="2" height="h-32" color="bg-slate-400" />
                   <PodiumSpot athlete={results[0]} rank="1" height="h-44" color="bg-yellow-500" isGold />
                   <PodiumSpot athlete={results[2]} rank="3" height="h-24" color="bg-orange-700" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumSpot({ athlete, rank, height, color, isGold }) {
  return (
    <div className={`flex flex-col items-center animate-rise-up`}>
      <img src={athlete.flag} className={`w-10 border ${isGold ? 'border-yellow-400 scale-125 mb-4' : 'border-white mb-2'}`} />
      <div className={`${height} w-24 ${color} flex flex-col items-center justify-center rounded-t-lg shadow-2xl`}>
        <span className={`text-3xl font-black ${isGold ? 'text-slate-900' : 'text-white'}`}>{rank}</span>
      </div>
      <p className="text-[10px] mt-2 font-bold uppercase tracking-widest">{athlete.athleteName}</p>
    </div>
  );
}
