// Base icon per time-of-day theme
const THEME_ICON = {
  dawn:      '🌅',
  morning:   '☀️',
  midday:    '☀️',
  afternoon: '🌤',
  dusk:      '🌇',
  night:     '🌙',
};

// Weather determines cloud/star overlay + how many cloud spans to render
function cloudConfig(code, isNight) {
  if (code == null) return { overlay: isNight ? '✨' : null, clouds: 0 };
  if (code === 0)   return { overlay: isNight ? '✨' : null, clouds: 0 };
  if (code <= 1)    return { overlay: isNight ? '⭐' : null, clouds: 1 };
  if (code <= 2)    return { overlay: null, clouds: 2 };
  if (code === 3)   return { overlay: null, clouds: 4 };
  if (code <= 48)   return { overlay: '🌫', clouds: 3 };
  if (code <= 55)   return { overlay: '🌦', clouds: 3 };
  if (code <= 65)   return { overlay: '🌧', clouds: 4 };
  if (code <= 75)   return { overlay: '❄️', clouds: 3 };
  if (code <= 82)   return { overlay: '🌦', clouds: 3 };
  return { overlay: '⛈', clouds: 4 };
}

// Cloud layer definitions — varying size, speed, vertical position, blur
const CLOUD_LAYERS = [
  { key: 'a', style: { top: '12%',  fontSize: '5rem',  animationDuration: '42s', animationDelay: '0s',    filter: 'blur(6px)',  opacity: 0.22 } },
  { key: 'b', style: { top: '28%',  fontSize: '7rem',  animationDuration: '62s', animationDelay: '-20s',  filter: 'blur(9px)',  opacity: 0.16 } },
  { key: 'c', style: { top: '8%',   fontSize: '4rem',  animationDuration: '34s', animationDelay: '-8s',   filter: 'blur(4px)',  opacity: 0.28 } },
  { key: 'd', style: { top: '40%',  fontSize: '9rem',  animationDuration: '78s', animationDelay: '-35s',  filter: 'blur(12px)', opacity: 0.13 } },
];

export default function SkyOrb({ themeName, weather }) {
  const isNight = themeName === 'night' || themeName === 'dusk';
  const icon    = THEME_ICON[themeName] ?? '☀️';
  const { overlay, clouds } = cloudConfig(weather?.code ?? null, isNight);
  const visibleClouds = CLOUD_LAYERS.slice(0, clouds);

  return (
    <div className="sky-orb" aria-hidden="true">
      {/* Drifting cloud layer */}
      {visibleClouds.map(c => (
        <span key={c.key} className="sky-orb__cloud" style={c.style}>☁️</span>
      ))}

      {/* Glow halo */}
      <div className={`sky-orb__glow sky-orb__glow--${themeName ?? 'midday'}`} />

      {/* Main celestial body */}
      <span className="sky-orb__icon">{icon}</span>

      {/* Weather overlay badge */}
      {overlay && <span className="sky-orb__overlay">{overlay}</span>}
    </div>
  );
}
