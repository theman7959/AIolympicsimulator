import React, { useState, useEffect } from 'react';

// Regional Data for AI Generation
const REGIONS = {
  "Americas": { 
    first: ["James", "Sofia", "Mateo", "Emma"], 
    last: ["Silva", "Smith", "Hernandez", "Jones"],
    facts: ["Grew up training in coastal heat.", "Previously a champion in youth baseball.", "Inspired by legendary sprinters from their home soil."]
  },
  "Europe": { 
    first: ["Lars", "Elena", "Sven", "Chloe"], 
    last: ["Müller", "Hansen", "Dubois", "Nielsen"],
    facts: ["Trained in elite academies across the continent.", "Holds a degree in sports science.", "Known for technical precision in high-pressure finals."]
  },
  "Asia": { 
    first: ["Wei", "Yuki", "Jung", "Ananya"], 
    last: ["Li", "Sato", "Kim", "Zhang"],
    facts: ["A national hero in their hometown.", "Spends 10 hours a day in specialized training facilities.", "Mastered traditional martial arts before switching to Olympic sports."]
  },
  "Africa": { 
    first: ["Kofi", "Zuri", "Abebe", "Amara"], 
    last: ["Keita", "Mensah", "Toure", "Bekele"],
    facts: ["Famous for training at high altitudes.", "Started running to commute to school as a child.", "A symbol of endurance and speed in their region."]
  },
  "Oceania": { 
    first: ["Finn", "Isla", "Kai", "Maia"], 
    last: ["Walker", "Pritchard", "Tuivasa", "Ngata"],
    facts: ["Spent years training in the surf and sand.", "A multi-sport athlete with a background in rugby.", "Known for incredible mental toughness."]
  }
};

const EVENTS = [
  { id: '100m', name: "100m Sprint", unit: "s", base: 9.6 },
  { id: 'swimming', name: "50m Freestyle", unit: "s", base: 21.0 },
  { id: 'longjump', name: "Long Jump", unit: "m", base: 8.5 }
];

export default function OlympicSim() {
  const [allCountries, setAllCountries] = useState([]);
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeEvent, setActiveEvent] = useState(EVENTS[0]);
  
  // Persistent Medal Table
  const [medals, setMedals] = useState(() => {
    const saved = localStorage.getItem('olympic_medals');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca3,region')
      .then(res => res.json())
      .then(data => setAllCountries(data.map(c => ({
        id: c.cca3,
        name: c.name.common,
        flag: c.flags.png,
        region: c.region
      })).sort((a, b) => a.name.localeCompare(b.name))));
  }, []);

  useEffect(() => {
    localStorage.setItem('olympic_medals', JSON.stringify(medals));
  }, [medals]);

  const generateAthlete = (country) => {
    const data = REGIONS[country.region] || REGIONS["Americas"];
    const first = data.first[Math.floor(Math.random() * data.first.length)];
    const last = data.last[Math.floor(Math.random() * data.last.length)];
    const fact = data.facts[Math.floor(Math.random() * data.facts.length)];
    return { 
      ...country, 
      athleteName: `${first} ${last}`, 
      bio: fact,
      uid: Math.random().toString(36).substr(2, 9)
    };
  };

  const handleSimulate = () => {
    if (selected.length !== 8) return;
    setIsSimulating(true);
    setResults([]);

    setTimeout(() => {
      const final = selected.map(a => ({
        ...a,
        score: (activeEvent.base + Math.random() * 2).toFixed(2)
      })).sort((a, b) => a.score - b.score);

      setResults(final);
      setIsSimulating(false);
      
      // Update Medal Tally
      const newMedals = { ...medals };
      ['gold', 'silver', 'bronze'].forEach((tier, i) => {
        const countryName = final[i].name;
        if (!newMedals[countryName]) newMedals[countryName] = { gold: 0, silver: 0, bronze: 0 };
        newMedals[countryName][tier]++;
      });
      setMedals(newMedals);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Selection & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <h1 className="text-4xl font-black text-yellow-500 italic uppercase">AI Games 2026</h1>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-500 uppercase">1. Pick Event</label>
            <select onChange={(e) => setActiveEvent(EVENTS.find(ev => ev.id === e.target.value))} className="w-full bg-slate-800 p-2 mt-2 rounded">
              {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-500 uppercase">2. Recruit Athletes ({selected.length}/8)</label>
            <div className="grid grid-cols-1 gap-2 mt-4 max-h-96 overflow-y-auto">
              {allCountries.map(c => (
                <button key={c.id} onClick={() => selected.length < 8 && setSelected([...selected, generateAthlete(c)])}
                  className="flex items-center gap-3 p-2 bg-slate-800 rounded hover:bg-slate-700 text-sm">
                  <img src={c.flag} className="w-6 h-4 object-cover" /> {c.name}
                </button>
              ))}
            </div>
            <button onClick={() => setSelected([])} className="w-full mt-4 text-xs text-slate-500 underline">Reset Selection</button>
          </div>
        </div>

        {/* Live Track & Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border-t-4 border-blue-500">
            <h2 className="font-bold text-xl mb-6">Current Heat: {activeEvent.name}</h2>
            <div className="space-y-3">
              {(results.length > 0 ? results : selected).map((a, i) => (
                <div key={a.uid} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{i + 1}</span>
                      <img src={a.flag} className="w-6" />
                      <span className="font-bold">{a.athleteName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic uppercase tracking-wider">{a.bio}</p>
                  </div>
                  {results.length > 0 && <span className="font-mono text-yellow-500 font-bold">{a.score}{activeEvent.unit}</span>}
                </div>
              ))}
            </div>
            {selected.length === 8 && !isSimulating && (
              <button onClick={handleSimulate} className="w-full mt-6 py-4 bg-yellow-500 text-black font-black rounded-xl">START BROADCAST</button>
            )}
          </div>
        </div>

        {/* Persistent Medal Count */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 sticky top-12">
            <h2 className="text-center font-bold text-slate-400 mb-6 uppercase tracking-widest text-xs">All-Time Medal Standings</h2>
            <div className="space-y-4">
              {Object.entries(medals)
                .sort(([, a], [, b]) => b.gold - a.gold || b.silver - a.silver)
                .slice(0, 10)
                .map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-sm font-bold truncate w-24">{name}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-yellow-500">🥇{count.gold}</span>
                      <span className="text-slate-300">🥈{count.silver}</span>
                      <span className="text-orange-600">🥉{count.bronze}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
