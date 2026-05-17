import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWeather } from '../hooks/useWeather';
import { SPECIES } from '../data/species';

const DEFAULT_USER = {
  name: 'Plant Parent',
  bio: 'Keeper of green things.',
  avatarModelIdx: 0,
  gardenName: 'My Garden',
  accent: null,
  streak: 0,
  lastWateredDay: null,
};

const DEFAULT_SETTINGS = {
  darkMode: true,
  notifications: false,
  themeOverride: null,
  isPro: false,
  lastTipDate: null,
  lastStreakMilestone: 0,
};

const DEMO_PLANTS = [
  { id: 1001, addedAt: Date.now() - 1000*60*60*24*30, lastWatered: Date.now() - 1000*60*60*20, species: SPECIES[0], nickname: 'Gaia' },
  { id: 1002, addedAt: Date.now() - 1000*60*60*24*60, lastWatered: Date.now() - 1000*60*60*72, species: SPECIES[7], nickname: 'Apollo' },
  { id: 1003, addedAt: Date.now() - 1000*60*60*24*14, lastWatered: Date.now() - 1000*60*60*4,  species: SPECIES[4], nickname: 'Medusa' },
];

const PlantContext = createContext(null);

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function normalizeUser(raw) {
  if (!isObject(raw)) return DEFAULT_USER;
  return {
    ...DEFAULT_USER,
    ...raw,
    avatarModelIdx: Number.isFinite(raw.avatarModelIdx) ? raw.avatarModelIdx : 0,
    streak: Number.isFinite(raw.streak) ? raw.streak : 0,
  };
}

function normalizeSettings(raw) {
  if (!isObject(raw)) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    darkMode: typeof raw.darkMode === 'boolean' ? raw.darkMode : DEFAULT_SETTINGS.darkMode,
    notifications: typeof raw.notifications === 'boolean' ? raw.notifications : DEFAULT_SETTINGS.notifications,
    isPro: typeof raw.isPro === 'boolean' ? raw.isPro : DEFAULT_SETTINGS.isPro,
  };
}

function normalizePlants(raw) {
  return Array.isArray(raw) ? raw : [];
}

export function PlantProvider({ children }) {
  const [plantsRaw, setPlants] = useLocalStorage('anl_plants_v2', []);
  const [userRaw, setUser] = useLocalStorage('anl_user', DEFAULT_USER);
  const [settingsRaw, setSettings] = useLocalStorage('anl_settings', DEFAULT_SETTINGS);

  // Photo journal — { [plantId]: { dataUrl: string, capturedAt: number } }
  const [photos, setPhotos] = useLocalStorage('anl_photos', {});

  function setPlantPhoto(plantId, dataUrl) {
    setPhotos(prev => ({ ...prev, [plantId]: { dataUrl, capturedAt: Date.now() } }));
  }

  function removePlantPhoto(plantId) {
    setPhotos(prev => {
      const next = { ...prev };
      delete next[plantId];
      return next;
    });
  }

  // Plant health event log — { [plantId]: [{ type, timestamp, note? }] }
  const [events, setEvents] = useLocalStorage('anl_events', {});

  function addPlantEvent(plantId, type, note) {
    const entry = { type, timestamp: Date.now() };
    if (note) entry.note = note;
    setEvents(prev => ({
      ...prev,
      [plantId]: [entry, ...(prev[plantId] ?? [])].slice(0, 50),
    }));
  }

  function getPlantEvents(plantId) {
    return events[plantId] ?? [];
  }

  // Per-plant reminder times — { [plantId]: 'HH:MM' | null }
  const [reminders, setReminders] = useLocalStorage('anl_reminders', {});

  function setPlantReminder(plantId, time) {
    setReminders(prev => {
      const next = { ...prev };
      if (time) next[plantId] = time;
      else delete next[plantId];
      return next;
    });
  }

  function getPlantReminder(plantId) {
    return reminders[plantId] ?? null;
  }

  const plants = normalizePlants(plantsRaw);
  const user = normalizeUser(userRaw);
  const settings = normalizeSettings(settingsRaw);

  const { weather, loading: weatherLoading, error: weatherError, retryWeather } = useWeather();

  const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';

  // Seed demo plants on first render if ?demo=1
  useEffect(() => {
    if (!isDemo) return;
    setPlants(DEMO_PLANTS);
    setSettings(prev => ({ ...prev, isPro: true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  function addPlant(plant) {
    const now = Date.now();
    setPlants(prev => [...prev, { ...plant, id: now, addedAt: now, lastWatered: now }]);
  }

  function removePlant(id) {
    setPlants(prev => prev.filter(p => p.id !== id));
    setPhotos(prev => { const next = { ...prev }; delete next[id]; return next; });
    setEvents(prev => { const next = { ...prev }; delete next[id]; return next; });
  }

  function waterPlant(id) {
    const today = new Date().toDateString();
    setPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, lastWatered: Date.now() } : p))
    );
    addPlantEvent(id, 'watered');
    // Update streak
    setUser(prev => {
      const lastDay = prev.lastWateredDay;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = lastDay === today
        ? prev.streak
        : lastDay === yesterday
        ? (prev.streak ?? 0) + 1
        : 1;
      return { ...prev, streak, lastWateredDay: today };
    });
  }

  function updatePlant(id, updater) {
    setPlants(prev => prev.map(p => p.id === id ? updater(p) : p));
  }

  // Computed water level based on elapsed time since last watering
  function getWaterLevel(plant) {
    const freqMs = (plant.species?.waterFreqDays ?? 7) * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - (plant.lastWatered ?? plant.addedAt ?? Date.now());
    return Math.max(0, Math.min(100, 100 - (elapsed / freqMs) * 100));
  }

  // Happy level: water is critical; also considers live temp & sunlight (hidden stat)
  function getHappyLevel(plant) {
    const water = getWaterLevel(plant);
    if (!weather) return Math.max(10, Math.min(100, water * 0.65 + 35));

    // Temp comfort: parse "~70°F" → 70, compare to live outdoor temp
    const idealTemp = parseInt(String(plant.species?.temp ?? '70').replace(/[^\d]/g, ''), 10) || 70;
    const tempDiff  = Math.abs((weather.temp ?? 70) - idealTemp);
    const tempScore = tempDiff < 5 ? 100 : tempDiff < 10 ? 80 : tempDiff < 20 ? 60 : tempDiff < 30 ? 40 : 20;

    // Sunlight score: current weather code vs plant light preference
    const code  = weather.code ?? 0;
    const light = (plant.species?.light ?? 'any').toLowerCase();
    const isClear  = code <= 1;
    const isPartly = code <= 3;
    const lightScore = isClear
      ? ((light.includes('sunny') || light.includes('full')) ? 100 : light.includes('bright') ? 90 : 80)
      : isPartly
      ? ((light.includes('sunny') || light.includes('full')) ? 68 : light.includes('bright') ? 84 : 92)
      : ((light.includes('sunny') || light.includes('full')) ? 38 : light.includes('bright') ? 58 : 84);

    return Math.max(10, Math.min(100, water * 0.55 + tempScore * 0.20 + lightScore * 0.25));
  }

  // Human-readable age from addedAt timestamp
  function getAge(plant) {
    const days = (Date.now() - (plant.addedAt ?? Date.now())) / (24 * 60 * 60 * 1000);
    if (days < 1) return 'today';
    if (days < 30) return `${Math.floor(days)}d`;
    if (days < 365) return `${(days / 30).toFixed(1)}mo`;
    return `${(days / 365).toFixed(1)}yr`;
  }

  // Garden health grade — avg happy level across all plants
  function getGardenGrade() {
    if (plants.length === 0) return null;
    const avg = plants.reduce((sum, p) => sum + getHappyLevel(p), 0) / plants.length;
    if (avg >= 85) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 55) return 'C';
    if (avg >= 40) return 'D';
    return 'F';
  }

  return (
    <PlantContext.Provider
      value={{
        plants, addPlant, removePlant, waterPlant, updatePlant,
        getWaterLevel, getHappyLevel, getAge, getGardenGrade,
        user, setUser,
        settings, setSettings,
        photos, setPlantPhoto, removePlantPhoto,
        events, addPlantEvent, getPlantEvents,
        reminders, setPlantReminder, getPlantReminder,
        weather, weatherLoading, weatherError, retryWeather,
        isDemo,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlants must be used inside <PlantProvider>');
  return ctx;
}
