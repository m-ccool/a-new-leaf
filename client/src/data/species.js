// Static plant species catalog — seeded with representative entries
// Each entry maps to one of the 11 GLB models in public/models/
export const SPECIES = [
  { id: 1,  name: "Jade Plant",         latin: "Crassula ovata",         model: "/models/plant-1.glb",    water: "Low",    light: "Sunny",       temp: "~70°F", toxic: true,  perenualId: 1433  },
  { id: 2,  name: "Wandering Jew",      latin: "Tradescantia zebrina",   model: "/models/plant-2.glb",    water: "Medium", light: "Bright",      temp: "~65°F", toxic: false, perenualId: 5640  },
  { id: 3,  name: "Panda Plant",        latin: "Kalanchoe tomentosa",    model: "/models/plant-3.glb",    water: "Low",    light: "Sunny",       temp: "~72°F", toxic: true,  perenualId: 2791  },
  { id: 4,  name: "Poinsettia",         latin: "Euphorbia pulcherrima",  model: "/models/plant-4.glb",    water: "Medium", light: "Bright",      temp: "~68°F", toxic: true,  perenualId: 2002  },
  { id: 5,  name: "Snake Plant",        latin: "Sansevieria trifasciata",model: "/models/plant-5.glb",    water: "Low",    light: "Any",         temp: "~70°F", toxic: false, perenualId: 5035  },
  { id: 6,  name: "Peace Lily",         latin: "Spathiphyllum wallisii", model: "/models/plant-6.glb",    water: "Medium", light: "Low-Medium",  temp: "~65°F", toxic: true,  perenualId: 5297  },
  { id: 7,  name: "Bird of Paradise",   latin: "Strelitzia reginae",     model: "/models/plant-7.glb",    water: "Medium", light: "Full Sun",    temp: "~75°F", toxic: false, perenualId: 5466  },
  { id: 8,  name: "Aloe Vera",          latin: "Aloe barbadensis",       model: "/models/plant-8.glb",    water: "Low",    light: "Sunny",       temp: "~70°F", toxic: false, perenualId: 151   },
  { id: 9,  name: "ZZ Plant",           latin: "Zamioculcas zamiifolia", model: "/models/plant-9.glb",    water: "Low",    light: "Any",         temp: "~70°F", toxic: true,  perenualId: 5929  },
  { id: 10, name: "Boston Fern",        latin: "Nephrolepis exaltata",   model: "/models/plant-10.glb",   water: "High",   light: "Indirect",    temp: "~65°F", toxic: false, perenualId: 3695  },
  { id: 11, name: "Croton",             latin: "Codiaeum variegatum",    model: "/models/plant-6.5.glb",  water: "Medium", light: "Bright",      temp: "~72°F", toxic: true,  perenualId: 1535  },
];
