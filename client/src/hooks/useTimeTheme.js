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
    bg: 'linear-gradient(180deg, #06060f 0%, #0c0f1d 40%, #1a1542 80%, #2d1b69 100%)',
    label: 'Night',
    accent: '#6d28d9',
  },
  dawn: {
    name: 'dawn',
    bg: 'linear-gradient(180deg, #1a1042 0%, #5c2a6b 25%, #c85c50 55%, #f4a560 80%, #fde9b0 100%)',
    label: 'Dawn',
    accent: '#fb923c',
  },
  morning: {
    name: 'morning',
    bg: 'linear-gradient(180deg, #74c0fc 0%, #a8d8f0 45%, #d8eef7 80%, #eef7ff 100%)',
    label: 'Morning',
    accent: '#38bdf8',
  },
  midday: {
    name: 'midday',
    bg: 'linear-gradient(180deg, #0369a1 0%, #0ea5e9 30%, #38bdf8 60%, #bae6fd 90%, #e0f2fe 100%)',
    label: 'Midday',
    accent: '#0ea5e9',
  },
  afternoon: {
    name: 'afternoon',
    bg: 'linear-gradient(180deg, #0369a1 0%, #38bdf8 30%, #fbbf24 65%, #fb923c 85%, #fed7aa 100%)',
    label: 'Afternoon',
    accent: '#f59e0b',
  },
  dusk: {
    name: 'dusk',
    bg: 'linear-gradient(180deg, #1e1b4b 0%, #4c1d95 20%, #7c3aed 40%, #c084fc 60%, #f472b6 80%, #fde68a 100%)',
    label: 'Dusk',
    accent: '#c084fc',
  },
};

export const THEME_LIST = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'night'];

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
