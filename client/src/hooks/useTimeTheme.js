import { useState, useEffect } from 'react';

// Hour ranges for each slot (used to compute progress 0–1)
const SLOT_RANGES = {
  dawn:      [5,  7],
  morning:   [7,  11],
  midday:    [11, 16],
  afternoon: [16, 19],
  dusk:      [19, 22],
  night:     [22, 29], // wraps midnight; hours < 5 get +24
};

function getSlot(hour) {
  if (hour >= 5  && hour < 7)  return 'dawn';
  if (hour >= 7  && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'midday';
  if (hour >= 16 && hour < 19) return 'afternoon';
  if (hour >= 19 && hour < 22) return 'dusk';
  return 'night';
}

function getProgress(slot) {
  const [start, end] = SLOT_RANGES[slot];
  const now = new Date();
  let h = now.getHours() + now.getMinutes() / 60;
  if (slot === 'night' && h < 5) h += 24;
  return Math.max(0, Math.min(1, (h - start) / (end - start)));
}

// Each theme defines the sky gradient + CSS-var overrides applied via data-theme attr
export const THEMES = {
  night: {
    name: 'night',
    bg: 'linear-gradient(180deg, #02020e 0%, #080c22 35%, #131640 70%, #1e1b4b 100%)',
    label: 'Night',
    accent: '#6d28d9',
  },
  dawn: {
    name: 'dawn',
    bg: 'linear-gradient(180deg, #2d1b69 0%, #8b3f7e 28%, #d46b60 55%, #f2a06a 78%, #fce5b0 100%)',
    label: 'Dawn',
    accent: '#fb923c',
  },
  morning: {
    name: 'morning',
    bg: 'linear-gradient(135deg, #38bdf8 0%, #1d78d8 45%, #312e9a 100%)',
    label: 'Day',
    accent: '#38bdf8',
  },
  midday: {
    name: 'midday',
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #3730a3 100%)',
    label: 'Midday',
    accent: '#0ea5e9',
  },
  afternoon: {
    name: 'afternoon',
    bg: 'linear-gradient(180deg, #8dd6f7 0%, #d8c2f5 35%, #f7d78a 62%, #f4a06a 82%, #fddbb4 100%)',
    label: 'Afternoon',
    accent: '#f59e0b',
  },
  dusk: {
    name: 'dusk',
    bg: 'linear-gradient(180deg, #0d0c2b 0%, #1e1b5e 22%, #3730a3 45%, #6d5dd3 65%, #c4a8e8 82%, #f5e8d0 100%)',
    label: 'Dusk',
    accent: '#a89fdd',
  },
};

export const THEME_LIST = ['dawn', 'morning', 'dusk', 'night'];

export function useTimeTheme(override = null) {
  const [auto, setAuto] = useState(() => {
    const slot = getSlot(new Date().getHours());
    return { ...THEMES[slot], progress: getProgress(slot) };
  });

  useEffect(() => {
    const update = () => {
      const slot = getSlot(new Date().getHours());
      setAuto({ ...THEMES[slot], progress: getProgress(slot) });
    };
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  if (override && THEMES[override]) {
    return { ...THEMES[override], progress: 1 };
  }
  return auto;
}
