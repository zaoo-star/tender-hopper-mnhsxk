import React, { useState, useEffect, useMemo, useCallback } from "react";

const RECOVERY_TIME_MS = 24 * 60 * 60 * 1000;
const UNIT_TYPES = {
  spear: {
    name: "Kopiník",
    attack: 10,
    defense: 25,
    morale: 100,
    speed: 6,
    cost: { w: 60, s: 10, i: 15, f: 40, weapons: 1 },
    icon: "🔱",
  },
  sword: {
    name: "Šermíř",
    attack: 25,
    defense: 20,
    morale: 100,
    speed: 8,
    cost: { w: 10, s: 15, i: 80, f: 50, weapons: 1 },
    icon: "🛡️",
  },
  archer: {
    name: "Lučištník",
    attack: 30,
    defense: 10,
    morale: 90,
    speed: 6,
    cost: { w: 100, s: 10, i: 10, f: 50, weapons: 1 },
    icon: "🏹",
  },
  spy: {
    name: "Špeh",
    attack: 2,
    defense: 2,
    morale: 120,
    speed: 3,
    cost: { w: 50, s: 50, i: 20, f: 30, weapons: 0 },
    icon: "👁️",
  },
  cavalry: {
    name: "Jízda",
    attack: 60,
    defense: 45,
    morale: 150,
    speed: 4,
    cost: { w: 50, s: 30, i: 200, f: 250, weapons: 1 },
    icon: "🐎",
  },
};
const BUILDING_STATS = {
  hq: { w: 100, s: 80, p: 2, t: 30, tools: 0 },
  barracks: { w: 150, s: 100, p: 5, t: 60, tools: 2 },
  workshop: { w: 120, s: 80, p: 2, t: 45, tools: 1 },
  woodcamp: { w: 50, s: 30, p: 1, t: 20, tools: 1 },
  quarry: { w: 40, s: 50, p: 1, t: 25, tools: 1 },
  ironmine: { w: 80, s: 80, p: 2, t: 35, tools: 2 },
  goldmine: { w: 300, s: 300, p: 3, t: 150, tools: 5 },
  pigfarm: { w: 60, s: 40, p: 1, t: 30, tools: 1 },
  farm: { w: 50, s: 50, p: 0, t: 40, tools: 1 },
  house: { w: 70, s: 60, p: 0, t: 45, tools: 1 },
  warehouse: { w: 80, s: 80, p: 1, t: 30, tools: 1 },
  wall: { w: 100, s: 200, p: 0, t: 60, tools: 3 },
};
const SKILLS_DATA = [
  { id: "gather", name: "Bohatá těžba", desc: "Suroviny +15%/lvl", icon: "⛏️" },
  { id: "combat", name: "Válečník", desc: "Síla +10%/lvl", icon: "⚔️" },
  { id: "speed", name: "Rychlý", desc: "Rychlost +10%/lvl", icon: "⚡" },
  { id: "heroAttack", name: "Útok", desc: "Útok +2/lvl", icon: "🗡️" },
  { id: "heroDefense", name: "Obrana", desc: "Obrana +2/lvl", icon: "🛡️" },
];
const INITIAL_HERO = {
  name: "Náčelník",
  level: 1,
  xp: 0,
  skillPoints: 0,
  baseAtk: 50,
  baseDef: 50,
  skills: { gather: 0, combat: 0, speed: 0, heroAttack: 0, heroDefense: 0 },
  isOnMission: false,
  deathTime: null,
  battlesWon: 0,
  battlesLost: 0,
  resourcesGathered: 0,
  missionsCompleted: 0,
  title: "Začátečník",
  mood: "neutral",
  loyalty: 50,
  personality: null,
};
const HERO_TITLES = [
  { min: 0, max: 5, name: "Začátečník" },
  { min: 6, max: 15, name: "Válečník" },
  { min: 16, max: 30, name: "Veterán" },
  { min: 31, max: 50, name: "Šampion" },
  { min: 51, max: 999, name: "Legenda" },
];
const HERO_MOODS = {
  happy: {
    emoji: "😊",
    text: "Šťastný",
    color: "text-green-500",
    loyaltyBonus: 5,
  },
  neutral: {
    emoji: "😐",
    text: "Neutrální",
    color: "text-stone-400",
    loyaltyBonus: 0,
  },
  sad: {
    emoji: "😔",
    text: "Smutný",
    color: "text-blue-400",
    loyaltyBonus: -5,
  },
  angry: {
    emoji: "😠",
    text: "Naštvaný",
    color: "text-red-500",
    loyaltyBonus: -10,
  },
  proud: {
    emoji: "😎",
    text: "Hrdý",
    color: "text-amber-500",
    loyaltyBonus: 10,
  },
};
const PERSONALITY_TRAITS = [
  {
    id: "brave",
    name: "Odvážný",
    desc: "+5% útok, -5% obrana",
    statsEffect: { atkMult: 1.05, defMult: 0.95 },
    icon: "🦁",
  },
  {
    id: "cautious",
    name: "Opatrný",
    desc: "+5% obrana, -5% útok",
    statsEffect: { atkMult: 0.95, defMult: 1.05 },
    icon: "🛡️",
  },
  {
    id: "greedy",
    name: "Chamtivý",
    desc: "+10% kořist",
    statsEffect: { lootMult: 1.1 },
    icon: "💰",
  },
  {
    id: "wise",
    name: "Moudrý",
    desc: "+20% XP",
    statsEffect: { xpMult: 1.2 },
    icon: "📚",
  },
  {
    id: "swift",
    name: "Rychlý",
    desc: "+15% rychlost",
    statsEffect: { speedMult: 1.15 },
    icon: "⚡",
  },
  {
    id: "strong",
    name: "Silný",
    desc: "+10% útok",
    statsEffect: { atkMult: 1.1 },
    icon: "💪",
  },
];
const PRODUCTION_RECIPES = {
  tool: {
    name: "Nástroj",
    icon: "🛠️",
    time: 10,
    cost: { wood: 20, stone: 10, iron: 5 },
    requires: "workshop",
    requiresLevel: 1,
  },
  weapon: {
    name: "Zbraň",
    icon: "⚔️",
    time: 15,
    cost: { wood: 10, iron: 30, stone: 5 },
    requires: "workshop",
    requiresLevel: 1,
  },
};

const BuildingIcon = ({ type, level }) => {
  const icons = {
    hq: "🏛️",
    barracks: "⚔️",
    workshop: "🔨",
    woodcamp: "🌲",
    quarry: "🪨",
    ironmine: "⛏️",
    goldmine: "💎",
    pigfarm: "🐷",
    farm: "🌾",
    house: "🏠",
    warehouse: "📦",
    wall: "🏰",
  };
  return (
    <div className="text-3xl">
      {icons[type] || "🏗️"}
      {level >= 5 && <span className="text-xs">★</span>}
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState("start");
  const [activeTab, setActiveTab] = useState("village");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showNotification, setShowNotification] = useState(null);
  const [resources, setResources] = useState({
    wood: 500,
    stone: 500,
    iron: 250,
    food: 300,
    gold: 0,
    pop: 15,
    tools: 5,
    weapons: 5,
  });
  const [buildings, setBuildings] = useState({
    hq: { level: 1, name: "Hlavní budova", desc: "Srdce vesnice" },
    barracks: { level: 0, name: "Kasárna", desc: "Výcvik armády" },
    workshop: { level: 0, name: "Dílna", desc: "Výroba nástrojů" },
    woodcamp: { level: 1, name: "Dřevorubec", desc: "Produkce dřeva" },
    quarry: { level: 1, name: "Kamenolom", desc: "Produkce kamene" },
    ironmine: { level: 0, name: "Železný důl", desc: "Produkce železa" },
    goldmine: { level: 0, name: "Zlatý důl", desc: "Těžba zlata" },
    pigfarm: { level: 1, name: "Vepřín", desc: "Produkce jídla" },
    farm: { level: 1, name: "Selský dvůr", desc: "Kapacita lidu" },
    house: { level: 0, name: "Ubytovna", desc: "Kapacita vojska" },
    warehouse: { level: 1, name: "Skladiště", desc: "Sklad surovin" },
    wall: { level: 0, name: "Hradby", desc: "Obrana sídla" },
  });
  const [troops, setTroops] = useState({
    spear: 0,
    sword: 1,
    archer: 1,
    spy: 0,
    cavalry: 0,
  });
  const [hero, setHero] = useState(INITIAL_HERO);
  const [missions, setMissions] = useState([]);
  const [constructions, setConstructions] = useState([]);
  const [reports, setReports] = useState([]);
  const [mapPos, setMapPos] = useState({ x: 500, y: 500 });
  const [discovered, setDiscovered] = useState({
    "500|500": true,
    "499|500": true,
    "501|500": true,
    "500|499": true,
    "500|501": true,
  });
  const [tileStates, setTileStates] = useState({});
  const [selectedTile, setSelectedTile] = useState(null);
  const [viewingMission, setViewingMission] = useState(null);
  const [viewingConstruction, setViewingConstruction] = useState(null);
  const [modalTab, setModalTab] = useState("gather");
  const [selection, setSelection] = useState({
    workers: 0,
    tools: 0,
    hasHero: false,
    miningMinutes: 30,
    troops: { spear: 0, sword: 0, archer: 0, spy: 0, cavalry: 0 },
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [productionQueue, setProductionQueue] = useState([]);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("tribeGameSave_v1");
      if (s) {
        const d = JSON.parse(s);
        if (d.version === 1) {
          setGameState(d.gameState || "start");
          setResources(d.resources);
          setBuildings(d.buildings);
          setTroops(d.troops);
          setHero(d.hero);
          setMissions(d.missions || []);
          setConstructions(d.constructions || []);
          setReports(d.reports || []);
          setMapPos(d.mapPos || { x: 500, y: 500 });
          setDiscovered(d.discovered);
          setTileStates(d.tileStates || {});
          setProductionQueue(d.productionQueue || []);
        }
      }
    } catch (e) {
      console.error("Load:", e);
    }
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      try {
        localStorage.setItem(
          "tribeGameSave_v1",
          JSON.stringify({
            version: 1,
            gameState,
            resources,
            buildings,
            troops,
            hero,
            missions,
            constructions,
            reports: reports.slice(0, 50),
            mapPos,
            discovered,
            tileStates,
            productionQueue,
            lastSaved: Date.now(),
          })
        );
      } catch (e) {
        console.error("Save:", e);
      }
    }
  }, [
    gameState,
    resources,
    buildings,
    troops,
    hero,
    missions,
    constructions,
    reports,
    mapPos,
    discovered,
    tileStates,
    productionQueue,
  ]);

  const getBuildTime = (k, l) =>
    Math.floor(BUILDING_STATS[k].t * Math.pow(1.2, l));
  const limits = useMemo(
    () => ({
      storage: Math.floor(1000 * Math.pow(1.5, buildings.warehouse.level || 1)),
      popMax: (buildings.farm.level || 1) * 10,
    }),
    [buildings]
  );
  const production = useMemo(
    () => ({
      wood: (buildings.woodcamp.level || 0) * 0.5,
      stone: (buildings.quarry.level || 0) * 0.4,
      iron: (buildings.ironmine.level || 0) * 0.2,
      food: (buildings.pigfarm.level || 0) * 0.3,
    }),
    [buildings]
  );
  const heroStats = useMemo(() => {
    const h = hero || INITIAL_HERO;
    const s = { ...INITIAL_HERO.skills, ...(h.skills || {}) };
    const skillAtkBonus = (s.heroAttack || 0) * 2;
    const skillDefBonus = (s.heroDefense || 0) * 2;
    const personality = h.personality
      ? PERSONALITY_TRAITS.find((p) => p.id === h.personality)
      : null;
    const personalityMult = personality?.statsEffect || {};
    const baseAttack = (h.baseAtk || 50) + skillAtkBonus;
    const baseDefense = (h.baseDef || 50) + skillDefBonus;
    return {
      attack: Math.floor(baseAttack * (personalityMult.atkMult || 1)),
      defense: Math.floor(baseDefense * (personalityMult.defMult || 1)),
      skillAtkBonus,
      skillDefBonus,
      baseAtk: h.baseAtk || 50,
      baseDef: h.baseDef || 50,
      gatherBonus: 1 + (s.gather || 0) * 0.15,
      combatBonus: 1 + (s.combat || 0) * 0.1,
      speedBonus: (1 + (s.speed || 0) * 0.1) * (personalityMult.speedMult || 1),
      xpBonus: personalityMult.xpMult || 1,
      lootBonus: personalityMult.lootMult || 1,
      personality,
    };
  }, [hero]);
  const isHeroDead = useMemo(() => {
    if (!hero?.deathTime) return false;
    return currentTime < hero.deathTime + RECOVERY_TIME_MS;
  }, [hero?.deathTime, currentTime]);
  const notify = useCallback((msg) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const loop = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setResources((p) => ({
        ...p,
        wood: Math.min(p.wood + production.wood / 10, limits.storage),
        stone: Math.min(p.stone + production.stone / 10, limits.storage),
        iron: Math.min(p.iron + production.iron / 10, limits.storage),
        food: Math.min(p.food + production.food / 10, limits.storage),
      }));
    }, 100);
    return () => clearInterval(loop);
  }, [gameState, production, limits]);

  const updateHeroXP = useCallback(
    (amount, context = "mission") => {
      setHero((prev) => {
        if (!prev) return prev;
        let nextXP = (prev.xp || 0) + Math.floor(amount * heroStats.xpBonus);
        let nextLevel = prev.level || 1;
        let nextPoints = prev.skillPoints || 0;
        let nextMood = prev.mood || "neutral";
        let nextLoyalty = prev.loyalty || 50;
        const xpNeeded = nextLevel * 100;
        if (nextXP >= xpNeeded) {
          nextXP -= xpNeeded;
          nextLevel += 1;
          nextPoints += 1;
          nextMood = "proud";
          nextLoyalty = Math.min(100, nextLoyalty + 5);
          notify("Hrdina posílil!");
        }
        const totalMissions = (prev.missionsCompleted || 0) + 1;
        const newTitle =
          HERO_TITLES.find(
            (t) => totalMissions >= t.min && totalMissions <= t.max
          )?.name || prev.title;
        const stats = {
          ...prev,
          xp: nextXP,
          level: nextLevel,
          skillPoints: nextPoints,
          mood: nextMood,
          loyalty: nextLoyalty,
          missionsCompleted: totalMissions,
          title: newTitle,
        };
        if (context === "victory") {
          stats.battlesWon = (prev.battlesWon || 0) + 1;
          stats.mood = "happy";
          stats.loyalty = Math.min(100, nextLoyalty + 10);
        } else if (context === "defeat") {
          stats.battlesLost = (prev.battlesLost || 0) + 1;
          stats.mood = "angry";
          stats.loyalty = Math.max(0, nextLoyalty - 15);
        } else if (context === "gather") {
          stats.resourcesGathered = (prev.resourcesGathered || 0) + amount;
        }
        return stats;
      });
    },
    [notify, heroStats.xpBonus]
  );

  const processMissionCompletion = useCallback(
    (m) => {
      try {
        if (!m || !m.id) return false;
        const coordKey = m.target ? `${m.target.x}|${m.target.y}` : "unknown";
        if (m.hasHero) setHero((h) => ({ ...h, isOnMission: false }));
        if (m.workers && Number(m.workers) > 0)
          setResources((r) => ({
            ...r,
            pop: (r.pop || 0) + Number(m.workers),
          }));
        let msg = "";
        if (m.isRecalling) {
          msg = `Jednotky se vrátily z ${m.target?.name || "cíle"}.`;
          if (m.tools && Number(m.tools) > 0)
            setResources((r) => ({
              ...r,
              tools: (r.tools || 0) + Number(m.tools),
            }));
        } else if (m.type === "attack") {
          const unitPower = Object.entries(m.troops || {}).reduce(
            (sum, [t, c]) => sum + (UNIT_TYPES[t]?.attack || 0) * (c || 0),
            0
          );
          const totalAtk =
            (unitPower + (m.hasHero ? heroStats.attack : 0)) *
            (m.hasHero ? heroStats.combatBonus : 1);
          const enemyDef = m.target?.defense || 100;
          if (totalAtk > enemyDef) {
            const gl = Math.floor(
              (50 + Math.floor(Math.random() * 100)) * heroStats.lootBonus
            );
            setResources((r) => ({
              ...r,
              gold: Math.min((r.gold || 0) + gl, limits.storage),
              wood: Math.min((r.wood || 0) + 300, limits.storage),
              stone: Math.min((r.stone || 0) + 300, limits.storage),
            }));
            msg = `Vítězství! Kořist: 💰${gl}`;
            if (m.hasHero)
              updateHeroXP(150 + Math.floor(Math.random() * 100), "victory");
          } else {
            msg = `Porážka v ${m.target?.name || "osadě"}!`;
            if (m.hasHero) {
              setHero((h) => ({
                ...h,
                deathTime: Date.now(),
                isOnMission: false,
                mood: "sad",
                loyalty: Math.max(0, (h.loyalty || 50) - 20),
              }));
              msg += ` Hrdina padl!`;
              updateHeroXP(20, "defeat");
            }
            m.troops = {};
          }
          if (m.tools)
            setResources((r) => ({
              ...r,
              tools: (r.tools || 0) + Number(m.tools),
            }));
        } else if (m.type === "scout") {
          const enemyDef = m.target?.defense || 100;
          setTileStates((prev) => ({
            ...prev,
            [coordKey]: {
              scouted: true,
              defense: enemyDef,
              loot: 100 + Math.floor(Math.random() * 200),
            },
          }));
          msg = `Průzkum: Obrana ${enemyDef}`;
          if (m.hasHero) updateHeroXP(60, "mission");
          if (m.tools)
            setResources((r) => ({
              ...r,
              tools: (r.tools || 0) + Number(m.tools),
            }));
        } else {
          const loot = Math.floor(m.potentialAmount || 0);
          if (m.res && m.res !== "none")
            setResources((r) => ({
              ...r,
              [m.res]: Math.min((r[m.res] || 0) + loot, limits.storage),
            }));
          msg = `Výprava: +${loot}x surovin`;
          if (m.tools) msg += ` (nástroje ztraceny)`;
          if (m.hasHero) updateHeroXP(40, "gather");
        }
        setReports((prev) => [
          { id: Date.now(), text: msg, time: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        setTroops((prev) => {
          const next = { ...prev };
          Object.entries(m.troops || {}).forEach(([t, c]) => {
            if (next[t] !== undefined) next[t] = (next[t] || 0) + Number(c);
          });
          return next;
        });
        return true;
      } catch (err) {
        console.error("Mission error:", err);
        if (m.workers)
          setResources((r) => ({
            ...r,
            pop: (r.pop || 0) + Number(m.workers),
          }));
        if (m.tools)
          setResources((r) => ({
            ...r,
            tools: (r.tools || 0) + Number(m.tools),
          }));
        if (m.hasHero) setHero((h) => ({ ...h, isOnMission: false }));
        return true;
      }
    },
    [heroStats, limits.storage, updateHeroXP]
  );

  useEffect(() => {
    if (gameState !== "playing") return;
    const now = currentTime;
    const finishedMissions = missions.filter((m) => m.endTime <= now);
    if (finishedMissions.length > 0) {
      finishedMissions.forEach((m) => processMissionCompletion(m));
      setMissions((prev) => prev.filter((m) => m.endTime > now));
    }
    const finishedConstructions = constructions.filter((c) => c.endTime <= now);
    if (finishedConstructions.length > 0) {
      finishedConstructions.forEach((c) => {
        setBuildings((prev) => ({
          ...prev,
          [c.buildingKey]: { ...prev[c.buildingKey], level: c.targetLevel },
        }));
        setReports((prev) => [
          {
            id: Date.now() + Math.random(),
            text: `✅ ${c.name} LV${c.targetLevel} hotova!`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        notify(`${c.name} hotova!`);
      });
      setConstructions((prev) => prev.filter((c) => c.endTime > now));
    }
    const finishedProduction = productionQueue.filter((p) => p.endTime <= now);
    if (finishedProduction.length > 0) {
      finishedProduction.forEach((p) => {
        if (p.itemKey === "tool")
          setResources((r) => ({ ...r, tools: (r.tools || 0) + 1 }));
        else if (p.itemKey === "weapon")
          setResources((r) => ({ ...r, weapons: (r.weapons || 0) + 1 }));
        setReports((prev) => [
          {
            id: Date.now() + Math.random(),
            text: `🔨 ${p.name} vyrobena`,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        notify(`${p.name} hotova!`);
      });
      setProductionQueue((prev) => prev.filter((p) => p.endTime > now));
    }
  }, [
    currentTime,
    missions,
    constructions,
    productionQueue,
    gameState,
    processMissionCompletion,
    notify,
  ]);

  const startBuild = (key) => {
    const s = BUILDING_STATS[key];
    const level = buildings[key].level || 0;
    const wood = Math.floor(s.w * Math.pow(1.4, level));
    const stone = Math.floor(s.s * Math.pow(1.4, level));
    const tools = Math.floor(s.tools * Math.pow(1.2, level));
    if (
      resources.wood >= wood &&
      resources.stone >= stone &&
      resources.tools >= tools &&
      resources.pop + s.p <= limits.popMax
    ) {
      setResources((r) => ({
        ...r,
        wood: r.wood - wood,
        stone: r.stone - stone,
        tools: r.tools - tools,
        pop: r.pop + s.p,
      }));
      const now = Date.now();
      const buildTime = s.t * Math.pow(1.2, level);
      setConstructions((prev) => [
        ...prev,
        {
          id: now,
          buildingKey: key,
          name: buildings[key].name,
          targetLevel: level + 1,
          startTime: now,
          endTime: now + buildTime * 1000,
        },
      ]);
      setReports((prev) => [
        {
          id: now,
          text: `🏗️ ${buildings[key].name} LV${level + 1} zahájena`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    }
  };

  const cancelConstruction = (c) => {
    if (!c) return;
    if (!window.confirm("Zrušit stavbu? Vrátí se 50% surovin.")) return;
    const s = BUILDING_STATS[c.buildingKey];
    const prevLevel = (c.targetLevel || 1) - 1;
    const wood = Math.floor(s.w * Math.pow(1.4, prevLevel));
    const stone = Math.floor(s.s * Math.pow(1.4, prevLevel));
    const tools = Math.floor(s.tools * Math.pow(1.2, prevLevel));
    setResources((r) => ({
      ...r,
      wood: Math.min((r.wood || 0) + Math.floor(wood * 0.5), limits.storage),
      stone: Math.min((r.stone || 0) + Math.floor(stone * 0.5), limits.storage),
      tools: (r.tools || 0) + Math.floor(tools * 0.5),
      pop: Math.max(0, (r.pop || 0) - s.p),
    }));
    setConstructions((prev) => prev.filter((item) => item.id !== c.id));
    setViewingConstruction(null);
    notify("Stavba zrušena");
  };

  const trainUnit = (uk) => {
    const u = UNIT_TYPES[uk];
    if (
      resources.weapons >= u.cost.weapons &&
      resources.wood >= u.cost.w &&
      resources.stone >= u.cost.s &&
      resources.iron >= u.cost.i &&
      resources.food >= u.cost.f
    ) {
      setResources((r) => ({
        ...r,
        wood: r.wood - u.cost.w,
        stone: r.stone - u.cost.s,
        iron: r.iron - u.cost.i,
        food: r.food - u.cost.f,
        weapons: r.weapons - u.cost.weapons,
      }));
      setTroops((t) => ({ ...t, [uk]: (t[uk] || 0) + 1 }));
      notify(`${u.name} vycvičen`);
    }
  };

  const startProduction = (ik) => {
    const recipe = PRODUCTION_RECIPES[ik];
    if (!recipe) return;
    if (
      recipe.requires &&
      buildings[recipe.requires].level < recipe.requiresLevel
    ) {
      notify(
        `Vyžaduje ${buildings[recipe.requires].name} LV${recipe.requiresLevel}`
      );
      return;
    }
    if (
      resources.wood >= recipe.cost.wood &&
      resources.stone >= recipe.cost.stone &&
      resources.iron >= recipe.cost.iron
    ) {
      setResources((r) => ({
        ...r,
        wood: r.wood - recipe.cost.wood,
        stone: r.stone - recipe.cost.stone,
        iron: r.iron - recipe.cost.iron,
      }));
      const now = Date.now();
      setProductionQueue((prev) => [
        ...prev,
        {
          id: now,
          itemKey: ik,
          name: recipe.name,
          icon: recipe.icon,
          startTime: now,
          endTime: now + recipe.time * 1000,
        },
      ]);
      notify(`${recipe.name} se vyrábí`);
    }
  };

  const cancelProduction = (prod) => {
    if (!prod) return;
    const recipe = PRODUCTION_RECIPES[prod.itemKey];
    setResources((r) => ({
      ...r,
      wood: Math.min(
        r.wood + Math.floor(recipe.cost.wood * 0.5),
        limits.storage
      ),
      stone: Math.min(
        r.stone + Math.floor(recipe.cost.stone * 0.5),
        limits.storage
      ),
      iron: Math.min(
        r.iron + Math.floor(recipe.cost.iron * 0.5),
        limits.storage
      ),
    }));
    setProductionQueue((prev) => prev.filter((p) => p.id !== prod.id));
    notify("Výroba zrušena");
  };

  const recallMission = (m) => {
    if (m.endTime <= currentTime || m.isRecalling) return;
    if (!window.confirm("Odvolat výpravu? Jednotky se vrátí okamžitě.")) return;
    const elapsed = currentTime - m.startTime;
    const duration = m.endTime - m.startTime;
    let returnTime;
    if (m.type === "gather") {
      const workDuration = (m.miningMinutes || 0) * 60000;
      const travelOneWay = (duration - workDuration) / 2;
      returnTime = elapsed < travelOneWay ? elapsed : travelOneWay;
    } else {
      const travelOneWay = duration / 2;
      returnTime = elapsed < travelOneWay ? elapsed : travelOneWay;
    }
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === m.id
          ? {
              ...mission,
              isRecalling: true,
              startTime: currentTime,
              endTime: currentTime + returnTime,
            }
          : mission
      )
    );
    setViewingMission(null);
    notify("Výprava odvolána");
  };

  const formatTime = (ms) => {
    if (ms <= 0) return "HOTOVO";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const getTileData = useCallback((x, y) => {
    if (x === 500 && y === 500)
      return {
        type: "home",
        name: "Vesnice",
        resource: "none",
        passable: true,
        icon: "🏠",
      };
    const hash = Math.abs((x * 2 + y * 3) % 8);
    const tileSeed = Math.abs(Math.sin(x * 1.23 + y * 4.56) * 100);
    const types = [
      { type: "forest", name: "Les", res: "wood", icon: "🌲", cap: 2000 },
      { type: "mountain", name: "Skály", res: "stone", icon: "🪨", cap: 1800 },
      { type: "grass", name: "Pláně", res: "food", icon: "🍗", cap: 1000 },
      { type: "iron", name: "Žíla", res: "iron", icon: "⛏️", cap: 1200 },
      {
        type: "water",
        name: "Bažiny",
        res: "none",
        icon: "🌊",
        passable: false,
      },
      { type: "forest", name: "Háj", res: "wood", icon: "🌲", cap: 1500 },
      { type: "grass", name: "Pastviny", res: "food", icon: "🍗", cap: 800 },
      {
        type: "enemy",
        name: "Loupežníci",
        res: "gold",
        icon: "🏰",
        def: 200 + Math.floor((tileSeed % 1) * 350),
      },
    ];
    const t = types[hash] || types[0];
    return {
      ...t,
      resource: t.res,
      baseCap: (t.cap || 1000) * (0.5 + (tileSeed % 1)),
      passable: t.passable !== false,
      defense: t.def || 0,
    };
  }, []);

  const calculateTravelTime = (tx, ty, sel) => {
    const dist = Math.sqrt(
      Math.pow(tx - mapPos.x, 2) + Math.pow(ty - mapPos.y, 2)
    );
    let slowest = 6;
    Object.entries(sel.troops).forEach(([key, count]) => {
      if (count > 0) slowest = Math.max(slowest, UNIT_TYPES[key]?.speed || 6);
    });
    const speedMultiplier = sel.hasHero ? 1 / heroStats.speedBonus : 1;
    return dist * slowest * 60000 * speedMultiplier;
  };

  const armyMorale = useMemo(() => {
    const totalTroops = Object.values(troops).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
    if (totalTroops === 0) return 100;
    const avgMorale =
      Object.entries(troops).reduce((sum, [type, count]) => {
        const unitMorale = UNIT_TYPES[type]?.morale || 100;
        return sum + unitMorale * (count || 0);
      }, 0) / totalTroops;
    return Math.floor(avgMorale);
  }, [troops]);

  if (gameState === "start") {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-stone-100">
        <div className="text-8xl mb-6 animate-pulse">👑</div>
        <h1 className="text-5xl mb-6 font-black uppercase">Vládce Kmenů</h1>
        <button
          onClick={() => setGameState("playing")}
          className="px-12 py-5 bg-amber-600 rounded-full text-xl font-black uppercase"
        >
          Vstoupit
        </button>
        <p className="mt-4 text-xs text-stone-600">✓ Auto-save</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-stone-900 text-stone-100 flex flex-col overflow-hidden">
      {showPersonalityModal && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg">
            <button
              onClick={() => setShowPersonalityModal(false)}
              className="mb-3 px-4 py-2 bg-stone-700 rounded-xl text-sm"
            >
              ← Zpět
            </button>
            <h1 className="text-3xl font-black text-center mb-6 text-amber-500">
              OSOBNOST HRDINY
            </h1>
            <div className="space-y-3">
              {PERSONALITY_TRAITS.map((trait) => (
                <button
                  key={trait.id}
                  onClick={() => {
                    setHero((prev) => ({ ...prev, personality: trait.id }));
                    setShowPersonalityModal(false);
                    notify(`${trait.name} zvolen!`);
                  }}
                  className="w-full bg-stone-800 border-2 border-stone-700 hover:border-amber-500 p-4 rounded-xl flex items-start space-x-3"
                >
                  <span className="text-4xl">{trait.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-black text-amber-500">
                      {trait.name}
                    </h3>
                    <p className="text-xs text-stone-400">{trait.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewingMission && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-stone-800 w-full max-w-sm rounded-2xl p-5 border border-stone-700">
            <button
              onClick={() => setViewingMission(null)}
              className="float-right text-2xl"
            >
              ✕
            </button>
            <h2
              className={`text-xl mb-3 font-black ${
                viewingMission.isRecalling ? "text-red-500" : "text-blue-500"
              }`}
            >
              {viewingMission.isRecalling ? "NÁVRAT" : "VÝPRAVA"}
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              {viewingMission.target?.name} [{viewingMission.target?.x}|
              {viewingMission.target?.y}]
            </p>
            <div className="space-y-3">
              <div className="bg-black/40 p-3 rounded-xl">
                <div className="text-xs text-stone-500 mb-1">Typ</div>
                <div className="text-sm">
                  {viewingMission.type === "attack"
                    ? "⚔️ ÚTOK"
                    : viewingMission.type === "scout"
                    ? "👁️ PRŮZKUM"
                    : "📦 SBĚR"}
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-xl">
                <div className="text-xs text-stone-500 mb-1">
                  {viewingMission.isRecalling ? "Návrat za" : "Dokončení za"}
                </div>
                <div className="text-lg font-mono text-amber-500">
                  {formatTime(viewingMission.endTime - currentTime)}
                </div>
              </div>
              {viewingMission.hasHero && (
                <div className="bg-amber-900/20 p-3 rounded-xl text-center text-amber-500 text-sm">
                  {hero.name} vede
                </div>
              )}
              {!viewingMission.isRecalling && (
                <button
                  onClick={() => recallMission(viewingMission)}
                  className="w-full py-3 bg-red-700 rounded-xl font-black"
                >
                  ODVOLAT
                </button>
              )}
              <button
                onClick={() => setViewingMission(null)}
                className="w-full py-2 bg-stone-700 rounded-xl text-xs"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingConstruction && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-stone-800 w-full max-w-sm rounded-2xl p-5 border border-stone-700">
            <button
              onClick={() => setViewingConstruction(null)}
              className="float-right text-2xl"
            >
              ✕
            </button>
            <h2 className="text-xl text-amber-500 mb-3 font-black">VÝSTAVBA</h2>
            <p className="text-xs text-stone-500 mb-4">
              {viewingConstruction.name} (LV {viewingConstruction.targetLevel})
            </p>
            <div className="space-y-3">
              <div className="bg-black/40 p-3 rounded-xl text-center">
                <div className="text-xs text-stone-500 mb-1">Dokončení za</div>
                <div className="text-lg font-mono text-amber-500">
                  {formatTime(viewingConstruction.endTime - currentTime)}
                </div>
              </div>
              <button
                onClick={() => cancelConstruction(viewingConstruction)}
                className="w-full py-3 bg-red-700 rounded-xl font-black"
              >
                ZRUŠIT
              </button>
              <button
                onClick={() => setViewingConstruction(null)}
                className="w-full py-2 bg-stone-700 rounded-xl text-xs"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-950 border-b border-stone-800 shrink-0">
        <div className="flex justify-around p-2 text-xs">
          <div>🌲 {Math.floor(resources.wood)}</div>
          <div>🪨 {Math.floor(resources.stone)}</div>
          <div>⛏️ {Math.floor(resources.iron)}</div>
          <div>🍗 {Math.floor(resources.food)}</div>
          <div>💰 {Math.floor(resources.gold)}</div>
          <div className={resources.pop >= limits.popMax ? "text-red-500" : ""}>
            👥 {resources.pop}/{limits.popMax}
          </div>
        </div>
        <div className="flex justify-center p-1 space-x-3 bg-stone-900/50 text-xs">
          <div>🛠️ {resources.tools}</div>
          <div>⚔️ {resources.weapons}</div>
          <div>👊 {Object.values(troops).reduce((a, b) => a + b, 0)}</div>
          <div>⭐ {hero.level}</div>
        </div>
      </div>

      {(missions.length > 0 || constructions.length > 0) && (
        <div className="bg-stone-800 border-b border-stone-700 p-2 flex space-x-2 overflow-x-auto text-xs">
          {constructions.map((c) => (
            <button
              key={c.id}
              onClick={() => setViewingConstruction(c)}
              className="flex-shrink-0 px-3 py-1 rounded-lg bg-amber-950/20 border border-amber-900/40"
            >
              🔨 {c.name} ({formatTime(c.endTime - currentTime)})
            </button>
          ))}
          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewingMission(m)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg ${
                m.isRecalling
                  ? "bg-red-950/20 border-red-900/40"
                  : "bg-blue-950/20 border-blue-900/40"
              } border`}
            >
              {m.isRecalling ? "NÁVRAT" : m.target?.name} (
              {formatTime(m.endTime - currentTime)})
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 pb-20">
        {activeTab === "village" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-green-900 to-amber-900 rounded-2xl p-6 aspect-video relative border-2 border-stone-800">
              {Object.entries(buildings).map(([key, b]) => {
                const level = b.level || 0;
                if (level === 0) return null;
                return (
                  <div
                    key={key}
                    className="absolute"
                    style={{
                      left: `${
                        {
                          hq: 50,
                          barracks: 75,
                          workshop: 50,
                          woodcamp: 20,
                          quarry: 85,
                          ironmine: 85,
                          goldmine: 35,
                          pigfarm: 25,
                          farm: 20,
                          house: 65,
                          warehouse: 15,
                          wall: 50,
                        }[key]
                      }%`,
                      top: `${
                        {
                          hq: 40,
                          barracks: 55,
                          workshop: 65,
                          woodcamp: 25,
                          quarry: 75,
                          ironmine: 15,
                          goldmine: 85,
                          pigfarm: 75,
                          farm: 55,
                          house: 30,
                          warehouse: 65,
                          wall: 90,
                        }[key]
                      }%`,
                      transform: "translate(-50%,-50%)",
                    }}
                  >
                    <BuildingIcon type={key} level={level} />
                  </div>
                );
              })}
            </div>
            <div className="space-y-3">
              {Object.entries(buildings).map(([key, b]) => {
                const s = BUILDING_STATS[key];
                const level = b.level || 0;
                const wood = Math.floor(s.w * Math.pow(1.4, level));
                const stone = Math.floor(s.s * Math.pow(1.4, level));
                const tools = Math.floor(s.tools * Math.pow(1.2, level));
                const canAfford =
                  resources.wood >= wood &&
                  resources.stone >= stone &&
                  resources.tools >= tools &&
                  resources.pop + s.p <= limits.popMax;
                const construction = constructions.find(
                  (c) => c.buildingKey === key
                );
                const isLocked = key === "wall" && buildings.hq.level < 3;
                return (
                  <div
                    key={key}
                    className="bg-stone-800/60 p-3 rounded-xl border border-stone-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-black">
                          {isLocked && (
                            <span className="text-red-500 mr-1">🔒</span>
                          )}
                          {b.name}{" "}
                          <span className="text-amber-500">LV{level}</span>
                        </h4>
                        <p className="text-xs text-stone-500">{b.desc}</p>
                      </div>
                      {construction ? (
                        <button
                          onClick={() => setViewingConstruction(construction)}
                          className="px-3 py-1 bg-amber-900/40 text-amber-500 rounded-lg text-xs"
                        >
                          STAVBA
                        </button>
                      ) : (
                        <button
                          onClick={() => startBuild(key)}
                          disabled={!canAfford || isLocked}
                          className={`px-3 py-1 rounded-lg text-xs ${
                            canAfford && !isLocked
                              ? "bg-green-600"
                              : "bg-stone-700 opacity-50"
                          }`}
                        >
                          VYLEPŠIT
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-xs text-center">
                      <div
                        className={
                          resources.wood < wood
                            ? "text-red-400"
                            : "text-amber-500"
                        }
                      >
                        🌲{wood}
                      </div>
                      <div
                        className={
                          resources.stone < stone
                            ? "text-red-400"
                            : "text-slate-400"
                        }
                      >
                        🪨{stone}
                      </div>
                      <div
                        className={
                          resources.tools < tools
                            ? "text-red-400"
                            : "text-blue-400"
                        }
                      >
                        🛠️{tools}
                      </div>
                      <div
                        className={
                          resources.pop + s.p > limits.popMax
                            ? "text-red-400"
                            : "text-pink-400"
                        }
                      >
                        👥{s.p}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "hero" && (
          <div className="space-y-4">
            {isHeroDead ? (
              <div className="bg-red-950/40 border-2 border-red-700 p-5 rounded-2xl text-center">
                <div className="text-5xl mb-2">💀</div>
                <h3 className="text-lg text-red-500 font-black">HRDINA PADL</h3>
                <div className="mt-3 text-lg font-mono text-red-400">
                  {formatTime(hero.deathTime + RECOVERY_TIME_MS - currentTime)}
                </div>
              </div>
            ) : hero.isOnMission ? (
              <div className="bg-blue-950/40 border-2 border-blue-700 p-5 rounded-2xl text-center">
                <div className="text-5xl mb-2">🧭</div>
                <h3 className="text-lg text-blue-500 font-black">NA VÝPRAVĚ</h3>
              </div>
            ) : (
              <div className="bg-green-950/40 border-2 border-green-700 p-5 rounded-2xl text-center">
                <div className="text-5xl mb-2">✅</div>
                <h3 className="text-lg text-green-500 font-black">PŘÍTOMEN</h3>
              </div>
            )}
            <div
              className={`p-6 rounded-2xl ${
                isHeroDead || hero.isOnMission
                  ? "bg-stone-900 grayscale"
                  : "bg-gradient-to-br from-amber-600 to-amber-900"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center border-4 border-amber-400 text-4xl">
                  👤
                </div>
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="bg-black/40 border-b border-amber-500 outline-none text-xl font-black px-2"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          tempName &&
                          (setHero((p) => ({ ...p, name: tempName.trim() })),
                          setIsEditingName(false))
                        }
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (tempName) {
                            setHero((p) => ({ ...p, name: tempName.trim() }));
                            setIsEditingName(false);
                          }
                        }}
                        className="p-2 bg-green-600 rounded-lg text-sm"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl text-white font-black">
                        {hero.name}
                      </h2>
                      <button
                        onClick={() => {
                          setTempName(hero.name);
                          setIsEditingName(true);
                        }}
                        className="p-1 text-white/30 text-sm"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  <div className="text-amber-200 text-xs mt-1">
                    LV{hero.level} • XP {hero.xp}/{hero.level * 100}
                  </div>
                  <div className="mt-2 w-full bg-black/40 h-1.5 rounded-full">
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${(hero.xp / (hero.level * 100)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-stone-800 p-4 rounded-2xl">
              <h3 className="text-xs text-stone-500 mb-3">STATISTIKY</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-stone-900/60 p-3 rounded-xl text-center">
                  <div className="text-xs text-stone-500">Titul</div>
                  <div className="text-sm font-black text-amber-500">
                    {hero.title}
                  </div>
                </div>
                <div className="bg-stone-900/60 p-3 rounded-xl text-center">
                  <div className="text-xs text-stone-500">Nálada</div>
                  <div className={`text-xl ${HERO_MOODS[hero.mood].color}`}>
                    {HERO_MOODS[hero.mood].emoji}
                  </div>
                </div>
              </div>
              <div className="bg-stone-900/60 p-3 rounded-xl mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-500">Loajalita</span>
                  <span className="text-amber-500">{hero.loyalty}/100</span>
                </div>
                <div className="w-full bg-stone-950 h-2 rounded-full">
                  <div
                    className={`h-full ${
                      hero.loyalty > 70
                        ? "bg-green-500"
                        : hero.loyalty > 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${hero.loyalty}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-900/60 p-2 rounded-xl text-center">
                  <div className="text-stone-500">⚔️ Vítězství</div>
                  <div className="text-lg font-mono text-green-500">
                    {hero.battlesWon || 0}
                  </div>
                </div>
                <div className="bg-stone-900/60 p-2 rounded-xl text-center">
                  <div className="text-stone-500">💀 Porážky</div>
                  <div className="text-lg font-mono text-red-500">
                    {hero.battlesLost || 0}
                  </div>
                </div>
              </div>
              {hero.personality ? (
                <div className="mt-3 bg-amber-900/40 p-3 rounded-xl border border-amber-700/50 flex items-center space-x-2">
                  <span className="text-2xl">
                    {
                      PERSONALITY_TRAITS.find((p) => p.id === hero.personality)
                        ?.icon
                    }
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-black text-amber-400">
                      {
                        PERSONALITY_TRAITS.find(
                          (p) => p.id === hero.personality
                        )?.name
                      }
                    </div>
                    <div className="text-xs text-stone-400">
                      {
                        PERSONALITY_TRAITS.find(
                          (p) => p.id === hero.personality
                        )?.desc
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPersonalityModal(true)}
                    className="px-2 py-1 bg-stone-700 rounded text-xs"
                  >
                    Změnit
                  </button>
                </div>
              ) : (
                <div className="mt-3 bg-stone-700/40 p-4 rounded-xl border-2 border-dashed border-stone-600 text-center">
                  <button
                    onClick={() => setShowPersonalityModal(true)}
                    className="px-4 py-2 bg-amber-600 rounded-xl text-sm font-black"
                  >
                    ZVOLIT OSOBNOST
                  </button>
                </div>
              )}
            </div>
            <div className="bg-stone-800 p-4 rounded-2xl">
              <h3 className="text-xs text-stone-500 mb-3">BOJOVÝ PROFIL</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div
                  className={`bg-stone-900/60 p-4 rounded-xl text-center ${
                    isHeroDead ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-xs text-stone-500 mb-1">ÚTOK</div>
                  <div
                    className={`text-3xl font-mono font-black ${
                      isHeroDead ? "text-stone-600" : "text-red-500"
                    }`}
                  >
                    ⚔️{heroStats.attack}
                  </div>
                </div>
                <div
                  className={`bg-stone-900/60 p-4 rounded-xl text-center ${
                    isHeroDead ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-xs text-stone-500 mb-1">OBRANA</div>
                  <div
                    className={`text-3xl font-mono font-black ${
                      isHeroDead ? "text-stone-600" : "text-blue-500"
                    }`}
                  >
                    🛡️{heroStats.defense}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-stone-800 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs text-stone-500">DOVEDNOSTI</h3>
                <span className="bg-amber-600 px-2 py-1 rounded-full text-xs font-black">
                  {hero.skillPoints || 0} BODY
                </span>
              </div>
              <div className="space-y-2">
                {SKILLS_DATA.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-stone-900/40 p-3 rounded-xl flex items-center space-x-3"
                  >
                    <div className="p-2 bg-stone-800 rounded-lg text-xl">
                      {skill.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span>{skill.name}</span>
                        <span className="text-amber-500">
                          LV{hero.skills[skill.id] || 0}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">{skill.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (hero.skillPoints > 0) {
                          setHero((p) => ({
                            ...p,
                            skillPoints: p.skillPoints - 1,
                            skills: {
                              ...p.skills,
                              [skill.id]: (p.skills[skill.id] || 0) + 1,
                            },
                          }));
                          notify("Vylepšeno!");
                        }
                      }}
                      disabled={hero.skillPoints <= 0 || isHeroDead}
                      className={`p-2 rounded-lg text-xl ${
                        hero.skillPoints > 0 && !isHeroDead
                          ? "bg-amber-600"
                          : "bg-stone-700 opacity-30"
                      }`}
                    >
                      ▶
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "production" && (
          <div className="space-y-4">
            <div className="bg-stone-800 p-4 rounded-2xl">
              <h3 className="text-xs text-stone-500 mb-3">VÝCVIK JEDNOTEK</h3>
              <div className="space-y-2">
                {Object.entries(UNIT_TYPES).map(([key, unit]) => {
                  const canTrain =
                    resources.weapons >= unit.cost.weapons &&
                    resources.wood >= unit.cost.w &&
                    resources.stone >= unit.cost.s &&
                    resources.iron >= unit.cost.i &&
                    resources.food >= unit.cost.f;
                  const needsBarracks = buildings.barracks.level < 1;
                  return (
                    <div key={key} className="bg-stone-900/40 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{unit.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-black">{unit.name}</h4>
                          <div className="text-xs text-stone-500">
                            ⚔️{unit.attack} 🛡️{unit.defense}
                          </div>
                        </div>
                        <div className="text-right text-amber-500 font-mono">
                          {troops[key] || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-xs text-center mb-2">
                        <div
                          className={
                            resources.wood < unit.cost.w
                              ? "text-red-400"
                              : "text-amber-500"
                          }
                        >
                          🌲{unit.cost.w}
                        </div>
                        <div
                          className={
                            resources.stone < unit.cost.s
                              ? "text-red-400"
                              : "text-slate-400"
                          }
                        >
                          🪨{unit.cost.s}
                        </div>
                        <div
                          className={
                            resources.iron < unit.cost.i
                              ? "text-red-400"
                              : "text-slate-500"
                          }
                        >
                          ⛏️{unit.cost.i}
                        </div>
                        <div
                          className={
                            resources.food < unit.cost.f
                              ? "text-red-400"
                              : "text-pink-500"
                          }
                        >
                          🍗{unit.cost.f}
                        </div>
                        <div
                          className={
                            resources.weapons < unit.cost.weapons
                              ? "text-red-400"
                              : "text-red-500"
                          }
                        >
                          ⚔️{unit.cost.weapons}
                        </div>
                      </div>
                      {needsBarracks ? (
                        <div className="bg-red-900/20 p-2 rounded text-center text-xs text-red-400">
                          Vyžaduje Kasárna
                        </div>
                      ) : (
                        <button
                          onClick={() => trainUnit(key)}
                          disabled={!canTrain}
                          className={`w-full py-2 rounded-xl text-xs font-black ${
                            canTrain
                              ? "bg-green-600"
                              : "bg-stone-700 opacity-50"
                          }`}
                        >
                          VYCVIČIT
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-stone-800 p-4 rounded-2xl">
              <h3 className="text-xs text-stone-500 mb-3">VÝROBA</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(PRODUCTION_RECIPES).map(([key, recipe]) => {
                  const canProduce =
                    resources.wood >= recipe.cost.wood &&
                    resources.stone >= recipe.cost.stone &&
                    resources.iron >= recipe.cost.iron;
                  const needsWorkshop =
                    !recipe.requires ||
                    buildings[recipe.requires].level < recipe.requiresLevel;
                  return (
                    <div key={key} className="bg-stone-900/40 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{recipe.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-xs font-black">{recipe.name}</h4>
                          <p className="text-xs text-stone-500">
                            {recipe.time}s
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-center mb-2">
                        <div
                          className={
                            resources.wood < recipe.cost.wood
                              ? "text-red-400"
                              : "text-amber-500"
                          }
                        >
                          🌲{recipe.cost.wood}
                        </div>
                        <div
                          className={
                            resources.stone < recipe.cost.stone
                              ? "text-red-400"
                              : "text-slate-400"
                          }
                        >
                          🪨{recipe.cost.stone}
                        </div>
                        <div
                          className={
                            resources.iron < recipe.cost.iron
                              ? "text-red-400"
                              : "text-slate-500"
                          }
                        >
                          ⛏️{recipe.cost.iron}
                        </div>
                      </div>
                      {needsWorkshop ? (
                        <div className="bg-red-900/20 p-2 rounded text-center text-xs text-red-400">
                          Dílna LV{recipe.requiresLevel}
                        </div>
                      ) : (
                        <button
                          onClick={() => startProduction(key)}
                          disabled={!canProduce}
                          className={`w-full py-2 rounded-xl text-xs font-black ${
                            canProduce
                              ? "bg-green-600"
                              : "bg-stone-700 opacity-50"
                          }`}
                        >
                          VYROBIT
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {productionQueue.length > 0 && (
                <div className="space-y-2">
                  {productionQueue.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-stone-900/60 p-2 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{prod.icon}</span>
                        <div>
                          <div className="text-xs font-black">{prod.name}</div>
                          <div className="text-xs text-stone-500">
                            {formatTime(prod.endTime - currentTime)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelProduction(prod)}
                        className="px-2 py-1 bg-red-700 rounded text-xs"
                      >
                        Zrušit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-stone-800 p-4 rounded-2xl">
            <h3 className="text-xs text-stone-500 mb-3">DENÍK UDÁLOSTÍ</h3>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-stone-600">
                <div className="text-5xl mb-3">📜</div>
                <p className="text-sm">Žádné zprávy</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reports.map((r) => (
                  <div key={r.id} className="bg-stone-900/40 p-3 rounded-xl">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-stone-300 flex-1">{r.text}</p>
                      <span className="text-xs text-stone-600 ml-2">
                        {r.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="bg-stone-800 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs text-stone-500">MAPA</h3>
                <div className="text-xs font-mono text-amber-500">
                  [{mapPos.x}|{mapPos.y}]
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-3">
                {Array.from({ length: 49 }, (_, i) => {
                  const offsetX = Math.floor(i % 7) - 3;
                  const offsetY = Math.floor(i / 7) - 3;
                  const tileX = mapPos.x + offsetX;
                  const tileY = mapPos.y + offsetY;
                  const coordKey = `${tileX}|${tileY}`;
                  const isDiscovered = discovered[coordKey];
                  const tileData = getTileData(tileX, tileY);
                  const isHome = tileX === 500 && tileY === 500;
                  const state = tileStates[coordKey];
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isDiscovered)
                          setSelectedTile({
                            x: tileX,
                            y: tileY,
                            data: tileData,
                            state,
                          });
                      }}
                      disabled={!isDiscovered}
                      className={`aspect-square rounded-lg border flex items-center justify-center text-xl ${
                        !isDiscovered
                          ? "bg-black border-stone-900"
                          : "bg-stone-900 border-stone-700"
                      } ${isHome ? "bg-amber-900/50 border-amber-600" : ""}`}
                    >
                      {isDiscovered ? (
                        <div className="relative">
                          {tileData.icon}
                          {state?.scouted && (
                            <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full w-1.5 h-1.5"></div>
                          )}
                        </div>
                      ) : (
                        "?"
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setMapPos((p) => ({ x: p.x, y: p.y - 1 }))}
                  className="bg-stone-700 p-3 rounded-xl text-2xl"
                >
                  ↑
                </button>
                <button
                  onClick={() => setMapPos((p) => ({ x: p.x, y: p.y + 1 }))}
                  className="bg-stone-700 p-3 rounded-xl text-2xl"
                >
                  ↓
                </button>
                <button
                  onClick={() => setMapPos((p) => ({ x: p.x - 1, y: p.y }))}
                  className="bg-stone-700 p-3 rounded-xl text-2xl"
                >
                  ←
                </button>
                <button
                  onClick={() => setMapPos((p) => ({ x: p.x + 1, y: p.y }))}
                  className="bg-stone-700 p-3 rounded-xl text-2xl"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTile && (
        <div
          className="fixed inset-0 z-[9998] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedTile(null)}
        >
          <div
            className="bg-stone-800 w-full max-w-lg rounded-2xl border border-stone-700 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-700 sticky top-0 bg-stone-800">
              <button
                onClick={() => setSelectedTile(null)}
                className="float-right text-2xl"
              >
                ✕
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{selectedTile.data.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-amber-500">
                    {selectedTile.data.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    [{selectedTile.x}|{selectedTile.y}]
                  </p>
                  {selectedTile.state?.scouted && (
                    <div className="flex space-x-2 text-xs mt-1">
                      <span className="bg-blue-900/40 px-2 py-0.5 rounded">
                        🏰{selectedTile.state.defense}
                      </span>
                      <span className="bg-amber-900/40 px-2 py-0.5 rounded">
                        💰~{selectedTile.state.loot}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex space-x-1 mb-4 border-b border-stone-700">
                {["gather", "attack", "scout"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`px-3 py-2 text-xs font-black ${
                      modalTab === tab
                        ? "text-amber-500 border-b-2 border-amber-500"
                        : "text-stone-600"
                    }`}
                  >
                    {tab === "gather" ? "📦" : tab === "attack" ? "⚔️" : "👁️"}
                  </button>
                ))}
              </div>

              {modalTab === "gather" &&
                selectedTile.data.resource &&
                selectedTile.data.resource !== "none" && (
                  <div className="space-y-3">
                    <div className="bg-stone-900/60 p-3 rounded-xl space-y-2">
                      <div>
                        <label className="text-xs text-stone-400">
                          Dělníci: {selection.workers}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max={resources.pop}
                          value={selection.workers}
                          onChange={(e) =>
                            setSelection((s) => ({
                              ...s,
                              workers: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">
                          Nástroje: {selection.tools}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max={resources.tools}
                          value={selection.tools}
                          onChange={(e) =>
                            setSelection((s) => ({
                              ...s,
                              tools: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400">
                          Čas: {selection.miningMinutes}min
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={selection.miningMinutes}
                          onChange={(e) =>
                            setSelection((s) => ({
                              ...s,
                              miningMinutes: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="heroG"
                          checked={selection.hasHero}
                          onChange={(e) =>
                            setSelection((s) => ({
                              ...s,
                              hasHero: e.target.checked,
                            }))
                          }
                          disabled={hero.isOnMission || isHeroDead}
                        />
                        <label
                          htmlFor="heroG"
                          className={`text-xs ${
                            hero.isOnMission || isHeroDead
                              ? "text-stone-600"
                              : "text-stone-400"
                          }`}
                        >
                          Poslat hrdinu (+
                          {Math.floor((heroStats.gatherBonus - 1) * 100)}%)
                        </label>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl">
                      <div className="text-xs text-stone-500 mb-1">
                        Výtěžek:
                      </div>
                      <div className="text-2xl font-mono text-amber-500">
                        {Math.floor(
                          (selection.workers * 10 + selection.tools * 20) *
                            (selection.miningMinutes / 30) *
                            (selection.hasHero ? heroStats.gatherBonus : 1)
                        )}
                        <span className="text-sm ml-2">
                          {selectedTile.data.resource === "wood"
                            ? "🌲"
                            : selectedTile.data.resource === "stone"
                            ? "🪨"
                            : selectedTile.data.resource === "iron"
                            ? "⛏️"
                            : "🍗"}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        Cesta:{" "}
                        {formatTime(
                          calculateTravelTime(
                            selectedTile.x,
                            selectedTile.y,
                            selection
                          ) *
                            2 +
                            selection.miningMinutes * 60000
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selection.workers === 0) {
                          notify("Vyber dělníky!");
                          return;
                        }
                        const now = Date.now();
                        const travelTime = calculateTravelTime(
                          selectedTile.x,
                          selectedTile.y,
                          selection
                        );
                        const workTime = selection.miningMinutes * 60000;
                        const totalTime = travelTime * 2 + workTime;
                        const amount =
                          (selection.workers * 10 + selection.tools * 20) *
                          (selection.miningMinutes / 30) *
                          (selection.hasHero ? heroStats.gatherBonus : 1);
                        setMissions((p) => [
                          ...p,
                          {
                            id: now,
                            type: "gather",
                            target: selectedTile,
                            workers: selection.workers,
                            tools: selection.tools,
                            hasHero: selection.hasHero,
                            miningMinutes: selection.miningMinutes,
                            res: selectedTile.data.resource,
                            potentialAmount: amount,
                            startTime: now,
                            endTime: now + totalTime,
                            troops: {},
                          },
                        ]);
                        setResources((r) => ({
                          ...r,
                          pop: r.pop - selection.workers,
                          tools: r.tools - selection.tools,
                        }));
                        if (selection.hasHero)
                          setHero((h) => ({ ...h, isOnMission: true }));
                        setSelection({
                          workers: 0,
                          tools: 0,
                          hasHero: false,
                          miningMinutes: 30,
                          troops: {
                            spear: 0,
                            sword: 0,
                            archer: 0,
                            spy: 0,
                            cavalry: 0,
                          },
                        });
                        setSelectedTile(null);
                        notify("Výprava vyslána!");
                      }}
                      className="w-full py-3 bg-green-600 rounded-xl font-black text-sm"
                    >
                      VYSLAT
                    </button>
                  </div>
                )}

              {modalTab === "gather" &&
                (!selectedTile.data.resource ||
                  selectedTile.data.resource === "none") && (
                  <div className="text-center py-8 text-stone-600">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="text-sm">Nelze těžit</p>
                  </div>
                )}

              {modalTab === "attack" && selectedTile.data.type === "enemy" && (
                <div className="space-y-3">
                  <div className="bg-red-900/20 p-3 rounded-xl border border-red-700/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">⚔️</span>
                      <h3 className="text-xs text-red-400">ÚTOK</h3>
                    </div>
                    <p className="text-xs text-stone-400">
                      {selectedTile.state?.scouted
                        ? `Obrana ${selectedTile.state.defense}`
                        : "Neprozkoumaný cíl"}
                    </p>
                  </div>
                  <div className="bg-stone-900/60 p-3 rounded-xl">
                    <h3 className="text-xs text-stone-500 mb-2">Jednotky:</h3>
                    <div className="space-y-1">
                      {Object.entries(UNIT_TYPES).map(([key, unit]) => {
                        const available = troops[key] || 0;
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{unit.icon}</span>
                              <span>{unit.name}</span>
                              <span className="text-stone-600">
                                ({available})
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={selection.troops[key] || 0}
                              onChange={(e) =>
                                setSelection((s) => ({
                                  ...s,
                                  troops: {
                                    ...s.troops,
                                    [key]: Math.min(
                                      parseInt(e.target.value) || 0,
                                      available
                                    ),
                                  },
                                }))
                              }
                              className="w-16 bg-stone-950 border border-stone-700 rounded px-1 py-0.5 text-center"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="heroA"
                        checked={selection.hasHero}
                        onChange={(e) =>
                          setSelection((s) => ({
                            ...s,
                            hasHero: e.target.checked,
                          }))
                        }
                        disabled={hero.isOnMission || isHeroDead}
                      />
                      <label
                        htmlFor="heroA"
                        className={`text-xs ${
                          hero.isOnMission || isHeroDead
                            ? "text-stone-600"
                            : "text-stone-400"
                        }`}
                      >
                        Hrdina (⚔️+{heroStats.attack})
                      </label>
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-xs text-stone-500">Tvůj útok</div>
                        <div className="text-xl font-mono text-red-500">
                          {Math.floor(
                            (Object.entries(selection.troops).reduce(
                              (sum, [t, c]) =>
                                sum + (UNIT_TYPES[t]?.attack || 0) * (c || 0),
                              0
                            ) +
                              (selection.hasHero ? heroStats.attack : 0)) *
                              (selection.hasHero ? heroStats.combatBonus : 1)
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Obrana</div>
                        <div className="text-xl font-mono text-blue-500">
                          {selectedTile.state?.scouted
                            ? selectedTile.state.defense
                            : "???"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 mt-1 text-center">
                      Cesta:{" "}
                      {formatTime(
                        calculateTravelTime(
                          selectedTile.x,
                          selectedTile.y,
                          selection
                        ) * 2
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const totalTroops = Object.values(
                        selection.troops
                      ).reduce((sum, c) => sum + (c || 0), 0);
                      if (totalTroops === 0 && !selection.hasHero) {
                        notify("Vyber jednotky!");
                        return;
                      }
                      const now = Date.now();
                      const travelTime = calculateTravelTime(
                        selectedTile.x,
                        selectedTile.y,
                        selection
                      );
                      setMissions((p) => [
                        ...p,
                        {
                          id: now,
                          type: "attack",
                          target: selectedTile,
                          troops: { ...selection.troops },
                          hasHero: selection.hasHero,
                          startTime: now,
                          endTime: now + travelTime * 2,
                        },
                      ]);
                      setTroops((prev) => {
                        const next = { ...prev };
                        Object.entries(selection.troops).forEach(([t, c]) => {
                          if (next[t] !== undefined)
                            next[t] = Math.max(0, next[t] - (c || 0));
                        });
                        return next;
                      });
                      if (selection.hasHero)
                        setHero((h) => ({ ...h, isOnMission: true }));
                      setSelection({
                        workers: 0,
                        tools: 0,
                        hasHero: false,
                        miningMinutes: 30,
                        troops: {
                          spear: 0,
                          sword: 0,
                          archer: 0,
                          spy: 0,
                          cavalry: 0,
                        },
                      });
                      setSelectedTile(null);
                      notify("Útok zahájen!");
                    }}
                    className="w-full py-3 bg-red-600 rounded-xl font-black text-sm"
                  >
                    ZAÚTOČIT
                  </button>
                </div>
              )}

              {modalTab === "attack" && selectedTile.data.type !== "enemy" && (
                <div className="text-center py-8 text-stone-600">
                  <div className="text-5xl mb-3">⚔️</div>
                  <p className="text-sm">Nelze útočit</p>
                </div>
              )}

              {modalTab === "scout" && (
                <div className="space-y-3">
                  {selectedTile.state?.scouted ? (
                    <div className="bg-green-900/20 p-3 rounded-xl border border-green-700/50 text-center">
                      <p className="text-sm text-green-400 mb-2">
                        ✓ Prozkoumáno
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/40 p-2 rounded">
                          <div className="text-stone-500">Obrana</div>
                          <div className="text-blue-400">
                            🏰{selectedTile.state.defense}
                          </div>
                        </div>
                        <div className="bg-black/40 p-2 rounded">
                          <div className="text-stone-500">Kořist</div>
                          <div className="text-amber-400">
                            💰~{selectedTile.state.loot}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-700/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">👁️</span>
                          <h3 className="text-xs text-blue-400">PRŮZKUM</h3>
                        </div>
                        <p className="text-xs text-stone-400">
                          Špehové prozkoumají oblast
                        </p>
                      </div>
                      <div className="bg-stone-900/60 p-3 rounded-xl">
                        <h3 className="text-xs text-stone-500 mb-2">
                          Špehové:
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span>{UNIT_TYPES.spy.icon}</span>
                            <span>{UNIT_TYPES.spy.name}</span>
                            <span className="text-stone-600">
                              ({troops.spy || 0})
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={troops.spy || 0}
                            value={selection.troops.spy || 0}
                            onChange={(e) =>
                              setSelection((s) => ({
                                ...s,
                                troops: {
                                  ...s.troops,
                                  spy: Math.min(
                                    parseInt(e.target.value) || 0,
                                    troops.spy || 0
                                  ),
                                },
                              }))
                            }
                            className="w-16 bg-stone-950 border border-stone-700 rounded px-1 py-0.5 text-center"
                          />
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="heroS"
                            checked={selection.hasHero}
                            onChange={(e) =>
                              setSelection((s) => ({
                                ...s,
                                hasHero: e.target.checked,
                              }))
                            }
                            disabled={hero.isOnMission || isHeroDead}
                          />
                          <label
                            htmlFor="heroS"
                            className={`text-xs ${
                              hero.isOnMission || isHeroDead
                                ? "text-stone-600"
                                : "text-stone-400"
                            }`}
                          >
                            Poslat hrdinu
                          </label>
                        </div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl text-center">
                        <div className="text-xs text-stone-500 mb-1">Cesta</div>
                        <div className="text-xl font-mono text-blue-500">
                          {formatTime(
                            calculateTravelTime(
                              selectedTile.x,
                              selectedTile.y,
                              {
                                ...selection,
                                troops: { spy: selection.troops.spy || 1 },
                              }
                            ) * 2
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            (selection.troops.spy || 0) === 0 &&
                            !selection.hasHero
                          ) {
                            notify("Vyber špeha!");
                            return;
                          }
                          const now = Date.now();
                          const travelTime = calculateTravelTime(
                            selectedTile.x,
                            selectedTile.y,
                            {
                              ...selection,
                              troops: { spy: selection.troops.spy || 1 },
                            }
                          );
                          setMissions((p) => [
                            ...p,
                            {
                              id: now,
                              type: "scout",
                              target: selectedTile,
                              troops: { spy: selection.troops.spy || 0 },
                              hasHero: selection.hasHero,
                              startTime: now,
                              endTime: now + travelTime * 2,
                            },
                          ]);
                          if (selection.troops.spy > 0)
                            setTroops((prev) => ({
                              ...prev,
                              spy: Math.max(
                                0,
                                (prev.spy || 0) - (selection.troops.spy || 0)
                              ),
                            }));
                          if (selection.hasHero)
                            setHero((h) => ({ ...h, isOnMission: true }));
                          setSelection({
                            workers: 0,
                            tools: 0,
                            hasHero: false,
                            miningMinutes: 30,
                            troops: {
                              spear: 0,
                              sword: 0,
                              archer: 0,
                              spy: 0,
                              cavalry: 0,
                            },
                          });
                          setSelectedTile(null);
                          setDiscovered((prev) => ({
                            ...prev,
                            [`${selectedTile.x}|${selectedTile.y}`]: true,
                          }));
                          notify("Průzkum zahájen!");
                        }}
                        className="w-full py-3 bg-blue-600 rounded-xl font-black text-sm"
                      >
                        VYSLAT
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-950 border-t border-stone-800 flex justify-around p-2 shrink-0">
        <button
          onClick={() => setActiveTab("village")}
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeTab === "village"
              ? "text-amber-500 bg-amber-500/10"
              : "text-stone-600"
          }`}
        >
          <div className="text-xl">🏛️</div>
          <span className="text-xs mt-1">SÍDLO</span>
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeTab === "hero"
              ? "text-amber-500 bg-amber-500/10"
              : "text-stone-600"
          }`}
        >
          <div className="text-xl">👤</div>
          <span className="text-xs mt-1">HRDINA</span>
        </button>
        <button
          onClick={() => setActiveTab("production")}
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeTab === "production"
              ? "text-amber-500 bg-amber-500/10"
              : "text-stone-600"
          }`}
        >
          <div className="text-xl">🔨</div>
          <span className="text-xs mt-1">VÝROBA</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeTab === "map"
              ? "text-amber-500 bg-amber-500/10"
              : "text-stone-600"
          }`}
        >
          <div className="text-xl">🗺️</div>
          <span className="text-xs mt-1">MAPA</span>
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center p-2 rounded-xl ${
            activeTab === "reports"
              ? "text-amber-500 bg-amber-500/10"
              : "text-stone-600"
          }`}
        >
          <div className="text-xl">📜</div>
          <span className="text-xs mt-1">DENÍK</span>
        </button>
      </div>

      {showNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-amber-600 text-white px-5 py-2 rounded-full shadow-2xl font-black text-sm animate-bounce">
          {showNotification}
        </div>
      )}
    </div>
  );
}
