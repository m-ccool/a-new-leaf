// Daily tip facts — one per species + generic plant wisdom
// shape: { speciesId: number | null, tip: string, emoji: string }
// speciesId null = shown when garden is empty or as a fallback

export const PLANT_TIPS = [
  // Species-specific
  { speciesId: 1,   emoji: '💚', tip: 'Jade Plants can live for decades. With enough light and minimal water, yours could outlast your furniture.' },
  { speciesId: 2,   emoji: '💜', tip: 'Wandering Jew grows so fast it can trail up to 2 feet in a single season. Pinch the tips to keep it bushy.' },
  { speciesId: 3,   emoji: '🐼', tip: 'Panda Plant\'s fuzzy leaves absorb moisture from the air. Misting the leaves is actually more harmful than helpful.' },
  { speciesId: 4,   emoji: '⭐', tip: 'Poinsettias aren\'t just for winter. In their native Mexico, they grow into trees up to 15 feet tall.' },
  { speciesId: 5,   emoji: '🐍', tip: 'Snake Plants convert CO₂ to oxygen at night — making them one of the best bedroom plants for air quality.' },
  { speciesId: 6,   emoji: '☮️', tip: 'Peace Lilies will tell you when they\'re thirsty — their leaves droop dramatically before bouncing back after watering.' },
  { speciesId: 7,   emoji: '🦜', tip: 'Bird of Paradise blooms are pollinated by birds in the wild. The "beak" petal protects nectar and dusts the bird\'s feet with pollen.' },
  { speciesId: 8,   emoji: '🌵', tip: 'Aloe Vera gel is 99% water. The plant stores enough liquid in its leaves to survive months without rain.' },
  { speciesId: 9,   emoji: '⚡', tip: 'ZZ Plants grow from large underground rhizomes that store water — that\'s why they can go weeks without a drink.' },
  { speciesId: 10,  emoji: '🌿', tip: 'Boston Ferns were air-purifying superstars in NASA\'s clean air study, filtering formaldehyde and xylene.' },
  { speciesId: 11,  emoji: '🎨', tip: 'Croton leaves change color based on light intensity — more sun means more vivid orange, red, and yellow tones.' },
  // Generic plant wisdom
  { speciesId: null, emoji: '🌱', tip: 'Overwatering kills more houseplants than underwatering. When in doubt, wait one more day.' },
  { speciesId: null, emoji: '🌬️', tip: 'Grouping plants together raises local humidity through transpiration — they thrive better in clusters.' },
  { speciesId: null, emoji: '🪟', tip: 'Most houseplants prefer bright indirect light — within 3 feet of a window, but not in direct afternoon sun.' },
  { speciesId: null, emoji: '🌡️', tip: 'Cold drafts from windows or AC vents stress tropical plants more than you might think. Keep them away from vents.' },
  { speciesId: null, emoji: '🧪', tip: 'Tap water left out overnight lets chlorine dissipate — gentler on sensitive roots than water straight from the tap.' },
];
