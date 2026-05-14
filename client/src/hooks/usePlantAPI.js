const API_KEY = process.env.REACT_APP_PERENUAL_KEY;
const BASE_V2  = 'https://perenual.com/api/v2';
const BASE_V1  = 'https://perenual.com/api';

export const hasApiKey = Boolean(API_KEY && API_KEY !== 'your_key_here');

// Map Perenual watering string to approximate days between watering
const WATER_DAYS = {
  Frequent: 2,
  Average: 7,
  Minimum: 14,
  None: 30,
};

export async function searchSpecies(query) {
  if (!hasApiKey || !query.trim()) return [];
  try {
    const res = await fetch(
      `${BASE_V2}/species-list?key=${API_KEY}&q=${encodeURIComponent(query.trim())}&page=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).slice(0, 8);
  } catch {
    return [];
  }
}

export async function getSpeciesDetails(id) {
  if (!hasApiKey || !id) return null;
  try {
    const res = await fetch(`${BASE_V2}/species/details/${id}?key=${API_KEY}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getDiseases() {
  if (!hasApiKey) return [];
  try {
    const res = await fetch(`${BASE_V1}/pest-disease-list?key=${API_KEY}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export function mapApiToSpecies(apiPlant, modelUrl) {
  const waterKey = apiPlant.watering ?? 'Average';
  return {
    id: `api-${apiPlant.id}`,
    name: apiPlant.common_name || apiPlant.scientific_name?.[0] || 'Unknown Plant',
    latin: apiPlant.scientific_name?.[0] || '',
    model: modelUrl,
    water: waterKey,
    light: Array.isArray(apiPlant.sunlight)
      ? apiPlant.sunlight[0]
      : (apiPlant.sunlight ?? 'Indirect'),
    temp: '~70°F',
    toxic: Boolean(apiPlant.poisonous_to_pets),
    waterFreqDays: WATER_DAYS[waterKey] ?? 7,
  };
}

// Assign a GLB model deterministically from the 11 available models.
// Keep these root-relative; PlantViewer resolves them with PUBLIC_URL once.
export const MODELS = [
  '/models/plant-1.glb', '/models/plant-2.glb', '/models/plant-3.glb',
  '/models/plant-4.glb', '/models/plant-5.glb', '/models/plant-6.glb',
  '/models/plant-6.5.glb', '/models/plant-7.glb', '/models/plant-8.glb',
  '/models/plant-9.glb', '/models/plant-10.glb',
];

export function modelForId(id) {
  const num = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 0;
  return MODELS[num % MODELS.length];
}
