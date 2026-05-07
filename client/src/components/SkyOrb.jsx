// Base icon per time-of-day theme
const THEME_ICON = {
  dawn:      '🌅',
  morning:   '☀️',
  midday:    '☀️',
  afternoon: '🌤️',
  dusk:      '🌇',
  night:     '🌙',
};

// Stars for night — scattered across upper ~35% of viewport
// [left_vw, top_vh, size_px, animDelay, duration]
const STARS_NIGHT = [
  [7,   4,  2.5, '0s',   '3.1s'], [14,  8,  1.5, '1.2s', '4.3s'],
  [23,  3,  2,   '0.6s', '2.8s'], [31, 13,  1.5, '2.1s', '3.6s'],
  [40,  6,  2,   '0.3s', '4.0s'], [50,  2,  2.5, '1.8s', '3.3s'],
  [58, 10,  1.5, '0.9s', '4.8s'], [67,  5,  2,   '1.5s', '2.9s'],
  [76,  8,  2.5, '2.4s', '3.7s'], [84,  3,  1.5, '0.7s', '4.2s'],
  [91,  7,  2,   '1.9s', '3.4s'], [11, 17,  1.5, '1.1s', '4.6s'],
  [20, 22,  1,   '2.7s', '3.8s'], [33, 19,  1.5, '0.4s', '2.6s'],
  [44, 25,  1,   '1.6s', '4.4s'], [55, 15,  2,   '3.1s', '3.1s'],
  [63, 21,  1.5, '0.8s', '3.9s'], [72, 18,  1,   '2.2s', '4.7s'],
  [82, 26,  1.5, '1.4s', '2.7s'], [96, 12,  2,   '0.2s', '3.5s'],
  [3,  20,  1,   '3.4s', '4.1s'], [48, 30,  1.5, '1.7s', '3.2s'],
];

// Stars for dusk — fewer, dimmer, only in dark upper portion of sky
const STARS_DUSK = [
  [9,   3,  1.5, '0.5s', '4.2s'], [22,  7,  1,   '1.8s', '3.8s'],
  [36,  2,  1.5, '0.9s', '4.6s'], [50,  5,  1,   '2.3s', '3.2s'],
  [64,  3,  1.5, '1.1s', '4.0s'], [78,  6,  1,   '0.3s', '3.5s'],
  [88,  8,  1.5, '1.7s', '4.8s'], [15, 12,  1,   '2.8s', '3.7s'],
  [42, 10,  1,   '0.7s', '4.3s'], [70, 11,  1.5, '1.3s', '2.9s'],
];

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

  const showStars = themeName === 'night' || themeName === 'dusk';
  const starData  = themeName === 'night' ? STARS_NIGHT : STARS_DUSK;

  return (
    <div className="sky-orb" aria-hidden="true">
      {/* Stars for night / dusk */}
      {showStars && starData.map(([x, y, size, delay, dur], i) => (
        <span
          key={`star-${i}`}
          className="sky-orb__star"
          style={{ left: `${x}vw`, top: `${y}vh`, width: `${size}px`, height: `${size}px`, animationDelay: delay, '--star-dur': dur }}
        />
      ))}

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
