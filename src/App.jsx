import React, { useState, useEffect } from 'react';

const ALL_COUNTRIES = [
  { id: 'USA', name: 'USA', flag: '🇺🇸', power: 95 },
  { id: 'CHN', name: 'China', flag: '🇨🇳', power: 94 },
  { id: 'JAM', name: 'Jamaica', flag: '🇯🇲', power: 92 },
  { id: 'GBR', name: 'UK', flag: '🇬🇧', power: 88 },
  { id: 'CAN', name: 'Canada', flag: '🇨🇦', power: 87 },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺', power: 89 },
  { id: 'FRA', name: 'France', flag: '🇫🇷', power: 86 },
  { id: 'GER', name: 'Germany', flag: '🇩🇪', power: 85 },
  { id: 'KEN', name: 'Kenya', flag: '🇰🇪', power: 90 },
  { id: 'BRA', name: 'Brazil', flag: '🇧🇷', power: 82 },
];

export default function OlympicSim() {
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Persistent Medal State
  const [medals, setMedals] = useState(() => {
    const saved = localStorage.getItem('olympicMedals');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('olympicMedals', JSON.stringify(medals));
  }, [medals]);

  const runSimulation = () => {
    if (selected.length !== 8) return alert("Select 8 countries!");
    setIsSimulating(true);

    setTimeout(() => {
      const heatResults = selected.map(c => ({
        ...c,
        time: (12 - (c.power / 20) + Math.random() * 0.5).toFixed(2)
      })).sort((a, b) => a.time - b.time);

      setResults(heatResults);
      setIsSimulating(false);
      updateMedals(heatResults);
    }, 1500);
  };

  const updateMedals = (standings) => {
    setMedals(prev => {
      const newMedals = { ...prev };
      ['gold', 'silver', 'bronze'].forEach((type, i) => {
        const countryId = standings[i].id;
        if (!newMedals[countryId]) newMedals[countryId] = { gold: 0, silver: 0, bronze: 0 };
        newMedals[countryId][type] += 1;
      });
      return newMedals;
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Race Controls */}
        <div className="flex-1">
          <h1 className="text-2xl font-black mb-6">ATHLETE SELECTION (Select 8)</h1>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ALL_COUNTRIES.map(c => (
              <button 
                key={c.id}
                onClick={() => selected.length < 8 && setSelected([...selected, c])}
                disabled={selected.includes(c)}
                className="p-2 bg-white border rounded shadow-sm hover:bg-blue-50 disabled:opacity-30"
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
          <button onClick={runSimulation} className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg">
            {isSimulating ? "RACING..." : "RUN EVENT"}
          </button>
        </div>

        {/* Right Side: Medal Table */}
        <div className="w-full md:w-80 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <h2 className="font-bold text-center mb-4 border-b pb-2 text-slate-600">ALL-TIME MEDAL COUNT</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left">Nation</th>
                <th>🥇</th><th>🥈</th><th>🥉</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(medals)
                .sort(([, a], [, b]) => b.gold - a.gold)
                .map(([id, counts]) => (
                  <tr key={id} className="border-t">
                    <td className="py-2 font-bold">{ALL_COUNTRIES.find(c => c.id === id)?.flag} {id}</td>
                    <td className="text-center">{counts.gold}</td>
                    <td className="text-center">{counts.silver}</td>
                    <td className="text-center">{counts.bronze}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button 
            onClick={() => { localStorage.clear(); setMedals({}); }}
            className="mt-4 text-xs text-red-400 hover:underline w-full"
          >
            Clear Records
          </button>
        </div>
      </div>
    </div>
  );
}
