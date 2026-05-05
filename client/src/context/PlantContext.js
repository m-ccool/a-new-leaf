import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PlantContext = createContext(null);

export function PlantProvider({ children }) {
  const [plants, setPlants] = useLocalStorage('anl_plants_v2', []);
  const [user, setUser] = useLocalStorage('anl_user', {
    name: 'Plant Parent',
    bio: 'Keeper of green things.',
    avatarModelIdx: 0,
  });
  const [settings, setSettings] = useLocalStorage('anl_settings', {
    darkMode: true,
    notifications: false,
    themeOverride: null,
  });

  function addPlant(plant) {
    const now = Date.now();
    setPlants(prev => [...prev, { ...plant, id: now, addedAt: now, lastWatered: now }]);
  }

  function removePlant(id) {
    setPlants(prev => prev.filter(p => p.id !== id));
  }

  function waterPlant(id) {
    setPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, lastWatered: Date.now() } : p))
    );
  }

  // Computed water level based on elapsed time since last watering
  function getWaterLevel(plant) {
    const freqMs = (plant.species?.waterFreqDays ?? 7) * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - (plant.lastWatered ?? plant.addedAt ?? Date.now());
    return Math.max(0, Math.min(100, 100 - (elapsed / freqMs) * 100));
  }

  // Happy level correlates with water but decays more slowly
  function getHappyLevel(plant) {
    const water = getWaterLevel(plant);
    return Math.max(10, Math.min(100, water * 0.65 + 35));
  }

  // Human-readable age from addedAt timestamp
  function getAge(plant) {
    const days = (Date.now() - (plant.addedAt ?? Date.now())) / (24 * 60 * 60 * 1000);
    if (days < 1) return 'today';
    if (days < 30) return `${Math.floor(days)}d`;
    if (days < 365) return `${(days / 30).toFixed(1)}mo`;
    return `${(days / 365).toFixed(1)}yr`;
  }

  return (
    <PlantContext.Provider
      value={{
        plants, addPlant, removePlant, waterPlant,
        getWaterLevel, getHappyLevel, getAge,
        user, setUser,
        settings, setSettings,
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
