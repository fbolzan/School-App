'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Trophy, 
  Users, 
  ChevronRight,
  Loader2,
  Swords,
  Zap,
  Globe
} from 'lucide-react';

const CATEGORIES = {
  "College Conference": [
    "SEC", "ACC", "Big East", "Big 12", "Big Ten", "Pac-12", 
    "Mountain West", "WCC", "AAC", "Atlantic 10", "Ivy League", "HBCU",
    "Missouri Valley", "Sun Belt", "MAC", "C-USA", "Horizon League",
    "Big Sky", "Patriot League", "SoCon", "WAC", "CAA", "OVC", "ASUN",
    "Big South", "MAAC", "MEAC", "NEC", "Southland", "Summit League", "SWAC"
  ],
  "International Region": [
    "Europe", "Balkans", "Africa", "Canada", "Australia/Oceania", 
    "South America", "France", "Spain", "Lithuania", "Germany", "Italy", "Slovenia", "Serbia"
  ],
  "Height": [
    "Under 6'0\"", "Under 6'3\"", "6'6\" to 6'9\"", "Over 7'0\"", "Over 7'3\""
  ],
  "Draft Position": [
    "Undrafted", "2nd Rounders", "Late 1st Round", "Lottery Picks", "Number 1 Picks"
  ],
  "Draft Decade": [
    "1980s", "1990s", "2000s", "2010s", "2020s"
  ],
  "Play Style / Trait": [
    "Pass-First Point Guards", "3-and-D Wings", "Rim Protectors", 
    "Slasher / Dunkers", "Left-Handed", "Same Last Name", "Journeymen (5+ teams)",
    "Defensive Specialists", "Sharpshooters", "Point Forwards", "Sixth Men"
  ]
};

const ERAS = ["Current (Active)", "Past (Retired)", "All-Time"];

type Player = {
  position: string;
  playerName: string;
  collegeOrTrait: string;
  reason: string;
  representativeSeason: string;
};

type Team = {
  teamName: string;
  teamColor: string;
  startingFive: Player[];
  bench: Player[];
};

type MatchupData = {
  matchupTitle: string;
  predictedWinner: string;
  team1: Team;
  team2: Team;
};

const PlayerStats = ({ playerName, season, teamColor }: { playerName: string, season: string, teamColor: string }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/nba/player/perSeasonAverages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName, season })
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Stats fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [playerName, season]);

  if (loading) return <div className="mt-3 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-zinc-500" /></div>;
  if (!stats) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-4 gap-2">
      <div className="text-center">
        <div className="text-[10px] font-black text-zinc-500 uppercase">PPG</div>
        <div className="text-sm font-black text-white">{stats.pts || stats.points || '-'}</div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-black text-zinc-500 uppercase">RPG</div>
        <div className="text-sm font-black text-white">{stats.reb || stats.rebounds || '-'}</div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-black text-zinc-500 uppercase">APG</div>
        <div className="text-sm font-black text-white">{stats.ast || stats.assists || '-'}</div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-black text-zinc-500 uppercase">Season</div>
        <div className="text-[10px] font-black" style={{ color: teamColor }}>{season}</div>
      </div>
    </div>
  );
};

const CourtPlayer = ({ player, top, left, teamColor }: { player: Player, top: string, left: string, teamColor: string }) => {
  if (!player) return null;
  // Use a higher quality seed and slightly different params for a "portrait" look
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(player.playerName + ' nba')}/400/400?grayscale&blur=1`;
  
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20" style={{ top, left }}>
      {/* Player Avatar / Position */}
      <div 
        className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:z-30 overflow-hidden border-2"
        style={{ 
          borderColor: teamColor,
          boxShadow: `0 0 20px ${teamColor}40, inset 0 0 20px ${teamColor}20`
        }}
      >
        <Image 
          src={imageUrl}
          alt={player.playerName}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/10 group-hover:opacity-0 transition-opacity">
            {player.position}
          </span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-4 w-56 sm:w-64 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-black text-white">{player.playerName}</div>
            <div className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/5">{player.position}</div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed italic">&quot;{player.reason}&quot;</p>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Scouting Report</span>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: teamColor }}>{player.collegeOrTrait}</span>
          </div>
          <PlayerStats playerName={player.playerName} season={player.representativeSeason} teamColor={teamColor} />
        </div>
      </div>
      
      {/* Name Label */}
      <div className="mt-4 bg-zinc-950/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 whitespace-nowrap shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="text-[10px] sm:text-xs font-black text-zinc-100 tracking-tight">{player.playerName}</div>
        <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-center mt-1 opacity-70" style={{ color: teamColor }}>{player.collegeOrTrait}</div>
      </div>
    </div>
  );
};

const CourtView = ({ players, teamColor }: { players: Player[], teamColor: string }) => {
  const getPlayer = (pos: string) => players.find(p => p.position === pos) || players[0];

  const pg = getPlayer('PG');
  const sg = getPlayer('SG');
  const sf = getPlayer('SF');
  const pf = getPlayer('PF');
  const c = getPlayer('C');

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square bg-zinc-950 rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl mb-6 group">
      {/* Court Background Glow */}
      <div className="absolute inset-0 opacity-20 transition-opacity duration-700 group-hover:opacity-30" style={{ background: `radial-gradient(circle at 50% 100%, ${teamColor}, transparent 70%)` }}></div>
      
      {/* Court Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ borderColor: teamColor }}>
        {/* Paint */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[45%] border-2 border-b-0" style={{ borderColor: teamColor }}></div>
        {/* Free throw circle */}
        <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-[20%] aspect-square border-2 rounded-full" style={{ borderColor: teamColor }}></div>
        {/* 3 point line (simplified) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[75%] border-2 border-b-0 rounded-t-full" style={{ borderColor: teamColor }}></div>
        {/* Basket/Backboard */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[10%] h-1 bg-white/50"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 border-2 rounded-full translate-y-1" style={{ borderColor: '#f97316' }}></div>
      </div>

      {/* Players */}
      <CourtPlayer player={pg} top="15%" left="50%" teamColor={teamColor} />
      <CourtPlayer player={sg} top="35%" left="15%" teamColor={teamColor} />
      <CourtPlayer player={sf} top="35%" left="85%" teamColor={teamColor} />
      <CourtPlayer player={pf} top="60%" left="30%" teamColor={teamColor} />
      <CourtPlayer player={c} top="75%" left="50%" teamColor={teamColor} />
    </div>
  );
};

export default function NBATeamGenerator() {
  // Team 1 State
  const [t1Era, setT1Era] = useState(ERAS[0]);
  const [t1Category, setT1Category] = useState<keyof typeof CATEGORIES>("College Conference");
  const [t1Theme, setT1Theme] = useState(CATEGORIES["College Conference"][0]);

  // Team 2 State
  const [t2Era, setT2Era] = useState(ERAS[1]);
  const [t2Category, setT2Category] = useState<keyof typeof CATEGORIES>("College Conference");
  const [t2Theme, setT2Theme] = useState(CATEGORIES["College Conference"][2]); // Big East
  
  const [loading, setLoading] = useState(false);
  const [matchupData, setMatchupData] = useState<MatchupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMatchup = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `
        Generate a fantasy basketball matchup between two specific theme teams.
        
        Team 1 Criteria:
        - Era: ${t1Era} (If "Current (Active)", ONLY players currently playing in the NBA. If "Past (Retired)", ONLY retired players. If "All-Time", anyone.)
        - Category: ${t1Category}
        - Theme: ${t1Theme}
        
        Team 2 Criteria:
        - Era: ${t2Era}
        - Category: ${t2Category}
        - Theme: ${t2Theme}
        
        STRICT RULES:
        1. Players MUST fit the era and theme perfectly.
        2. For smaller conferences (like Big Sky, SoCon, etc.), find the absolute best NBA players (past or present) who attended those schools.
        3. Starting lineup MUST have exactly one PG, one SG, one SF, one PF, and one C.
        4. Provide a hype title and a 7-game series prediction.
        5. For EACH player, provide a 'representativeSeason' in 'YYYY-YY' format (e.g., '2023-24', '1995-96'). For current players, use '2023-24'. For retired players, use their peak statistical season.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchupTitle: { type: Type.STRING, description: "A hype title for this matchup, e.g., 'Modern SEC Speed vs Old School Big East Grit'" },
              predictedWinner: { type: Type.STRING, description: "The predicted winner of the 7-game series and in how many games." },
              team1: {
                type: Type.OBJECT,
                properties: {
                  teamName: { type: Type.STRING },
                  teamColor: { type: Type.STRING, description: "A vibrant, neon hex color code representing the team's vibe (e.g., #FF0055, #00FFCC)" },
                  startingFive: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING, description: "PG, SG, SF, PF, or C" },
                        playerName: { type: Type.STRING },
                        collegeOrTrait: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        representativeSeason: { type: Type.STRING, description: "e.g. '2023-24'" }
                      },
                      required: ["position", "playerName", "collegeOrTrait", "reason", "representativeSeason"]
                    }
                  },
                  bench: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING },
                        playerName: { type: Type.STRING },
                        collegeOrTrait: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      },
                      required: ["position", "playerName", "collegeOrTrait", "reason"]
                    }
                  }
                },
                required: ["teamName", "teamColor", "startingFive", "bench"]
              },
              team2: {
                type: Type.OBJECT,
                properties: {
                  teamName: { type: Type.STRING },
                  teamColor: { type: Type.STRING, description: "A vibrant, neon hex color code representing the team's vibe (e.g., #FF0055, #00FFCC)" },
                  startingFive: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING },
                        playerName: { type: Type.STRING },
                        collegeOrTrait: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      },
                      required: ["position", "playerName", "collegeOrTrait", "reason"]
                    }
                  },
                  bench: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        position: { type: Type.STRING },
                        playerName: { type: Type.STRING },
                        collegeOrTrait: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        representativeSeason: { type: Type.STRING }
                      },
                      required: ["position", "playerName", "collegeOrTrait", "reason", "representativeSeason"]
                    }
                  }
                },
                required: ["teamName", "teamColor", "startingFive", "bench"]
              }
            },
            required: ["matchupTitle", "predictedWinner", "team1", "team2"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as MatchupData;
        setMatchupData(data);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate matchup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TeamControls = ({ 
    teamNum, 
    era, setEra, 
    category, setCategory, 
    theme, setTheme, 
    defaultColor
  }: any) => (
    <div className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 relative overflow-hidden group">
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 transition-colors duration-700 group-hover:opacity-30"
        style={{ backgroundColor: defaultColor }}
      ></div>
      <h3 className="font-black text-lg mb-4 relative z-10 flex items-center gap-2 text-white">
        <Users className="w-5 h-5" />
        Team {teamNum}
      </h3>
      
      <div className="space-y-4 relative z-10">
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Era</label>
          <select 
            value={era} 
            onChange={(e) => setEra(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none shadow-inner"
          >
            {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Category</label>
          <select 
            value={category} 
            onChange={(e) => {
              const newCat = e.target.value as keyof typeof CATEGORIES;
              setCategory(newCat);
              setTheme(CATEGORIES[newCat][0]);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none shadow-inner"
          >
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Specific Theme</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-bold text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none shadow-inner"
          >
            {CATEGORIES[category as keyof typeof CATEGORIES].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-white/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">FantasyMatchup<span className="text-pink-500">.AI</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Configure Matchup
              </h2>

              <div className="space-y-4 mb-8">
                <TeamControls 
                  teamNum={1}
                  era={t1Era} setEra={setT1Era}
                  category={t1Category} setCategory={setT1Category}
                  theme={t1Theme} setTheme={setT1Theme}
                  defaultColor="#ec4899" // pink-500
                />
                
                <div className="flex justify-center -my-6 relative z-20 pointer-events-none">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-full p-2 shadow-2xl">
                    <span className="text-xs font-black text-zinc-500 px-2 italic">VS</span>
                  </div>
                </div>

                <TeamControls 
                  teamNum={2}
                  era={t2Era} setEra={setT2Era}
                  category={t2Category} setCategory={setT2Category}
                  theme={t2Theme} setTheme={setT2Theme}
                  defaultColor="#8b5cf6" // violet-500
                />
              </div>

              <button
                onClick={generateMatchup}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    Generate Matchup
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {!matchupData && !loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-[2rem] bg-zinc-900/10"
                >
                  <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                    <Globe className="w-12 h-12 text-zinc-700" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-300 mb-4 tracking-tight">Awaiting Challengers</h3>
                  <p className="text-zinc-500 max-w-md text-lg font-medium">
                    Set up your dream matchup on the left. Current stars vs Past legends? SEC vs Big East? Europe vs USA? You decide.
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[600px] flex flex-col items-center justify-center"
                >
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Swords className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white animate-pulse tracking-tight">Simulating Matchup...</h3>
                  <p className="text-zinc-500 mt-3 font-medium">Analyzing historical data and player peaks</p>
                </motion.div>
              ) : matchupData ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col"
                >
                  {/* Matchup Header */}
                  <div className="mb-12 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      Main Event
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 leading-tight">
                      {matchupData.matchupTitle}
                    </h2>
                    <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${matchupData.team1.teamColor}20, ${matchupData.team2.teamColor}20)` }}></div>
                      <Trophy className="w-6 h-6 text-yellow-500 relative z-10" />
                      <span className="font-black text-xl text-white relative z-10">Prediction: {matchupData.predictedWinner}</span>
                    </div>
                  </div>

                  {/* Teams Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Team 1 */}
                    <div className="relative">
                      <div className="mb-6 text-center">
                        <div 
                          className="font-black text-xs uppercase tracking-widest mb-2"
                          style={{ color: matchupData.team1.teamColor }}
                        >
                          {t1Era} • {t1Theme}
                        </div>
                        <h3 className="text-3xl font-black tracking-tight">{matchupData.team1.teamName}</h3>
                      </div>
                      
                      <CourtView players={matchupData.team1.startingFive} teamColor={matchupData.team1.teamColor} />
                      
                      <div className="mt-6">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 text-center">The Bench</h4>
                        <div className="flex flex-col gap-3">
                          {matchupData.team1.bench.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                              <div 
                                className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10"
                                style={{ boxShadow: `0 0 15px ${matchupData.team1.teamColor}20` }}
                              >
                                <Image 
                                  src={`https://picsum.photos/seed/${encodeURIComponent(p.playerName + ' nba')}/200/200?grayscale&blur=1`}
                                  alt={p.playerName}
                                  fill
                                  className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md z-10 bg-black/30 group-hover:opacity-0 transition-opacity">
                                  {p.position}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-zinc-100 truncate group-hover:text-white transition-colors">{p.playerName}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest truncate mt-1 opacity-70" style={{ color: matchupData.team1.teamColor }}>{p.collegeOrTrait}</div>
                              </div>
                              
                              {/* Bench Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 shadow-2xl">
                                <p className="text-xs text-zinc-400 leading-relaxed text-center italic">&quot;{p.reason}&quot;</p>
                                <PlayerStats playerName={p.playerName} season={p.representativeSeason} teamColor={matchupData.team1.teamColor} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="relative">
                      <div className="mb-6 text-center">
                        <div 
                          className="font-black text-xs uppercase tracking-widest mb-2"
                          style={{ color: matchupData.team2.teamColor }}
                        >
                          {t2Era} • {t2Theme}
                        </div>
                        <h3 className="text-3xl font-black tracking-tight">{matchupData.team2.teamName}</h3>
                      </div>
                      
                      <CourtView players={matchupData.team2.startingFive} teamColor={matchupData.team2.teamColor} />
                      
                      <div className="mt-6">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 text-center">The Bench</h4>
                        <div className="flex flex-col gap-3">
                          {matchupData.team2.bench.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                              <div 
                                className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10"
                                style={{ boxShadow: `0 0 15px ${matchupData.team2.teamColor}20` }}
                              >
                                <Image 
                                  src={`https://picsum.photos/seed/${encodeURIComponent(p.playerName + ' nba')}/200/200?grayscale&blur=1`}
                                  alt={p.playerName}
                                  fill
                                  className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md z-10 bg-black/30 group-hover:opacity-0 transition-opacity">
                                  {p.position}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-zinc-100 truncate group-hover:text-white transition-colors">{p.playerName}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest truncate mt-1 opacity-70" style={{ color: matchupData.team2.teamColor }}>{p.collegeOrTrait}</div>
                              </div>
                              
                              {/* Bench Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 shadow-2xl">
                                <p className="text-xs text-zinc-400 leading-relaxed text-center italic">&quot;{p.reason}&quot;</p>
                                <PlayerStats playerName={p.playerName} season={p.representativeSeason} teamColor={matchupData.team2.teamColor} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
