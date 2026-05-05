import { usePlants } from '../context/PlantContext';
import { THEME_LIST, THEMES } from '../hooks/useTimeTheme';

// Gradient previews for each theme tile
const TILE_BG = {
  dawn:      'linear-gradient(145deg, #1a1042 0%, #c85c50 55%, #f4a560 100%)',
  morning:   'linear-gradient(145deg, #3b82f6 0%, #74c0fc 55%, #dbeafe 100%)',
  midday:    'linear-gradient(145deg, #0369a1 0%, #0ea5e9 45%, #7dd3fc 100%)',
  afternoon: 'linear-gradient(145deg, #0ea5e9 0%, #fbbf24 55%, #fed7aa 100%)',
  dusk:      'linear-gradient(145deg, #1e1b4b 0%, #7c3aed 45%, #f472b6 85%, #fde68a 100%)',
  night:     'linear-gradient(145deg, #020617 0%, #0f0a2e 45%, #2d1b69 100%)',
};

const TILE_EMOJI = {
  dawn:      '🌅',
  morning:   '🌤',
  midday:    '☀️',
  afternoon: '🌇',
  dusk:      '🌆',
  night:     '🌙',
};

export default function SettingsModal({ onClose }) {
  const { settings, setSettings } = usePlants();

  function toggle(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function setThemeOverride(t) {
    setSettings(prev => ({ ...prev, themeOverride: t }));
  }

  const currentOverride = settings.themeOverride ?? null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--center" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal__title">Settings</h2>

        <div className="settings__list">
          <div className="settings__row">
            <div>
              <p className="settings__row-title">Dark Glass</p>
              <p className="settings__row-sub">Dark tint with white text</p>
            </div>
            <button
              className={`toggle${settings.darkMode ? ' toggle--on' : ''}`}
              onClick={() => toggle('darkMode')}
              aria-pressed={settings.darkMode}
            >
              <span className="toggle__knob" />
            </button>
          </div>

          <div className="settings__row">
            <div>
              <p className="settings__row-title">Watering Reminders</p>
              <p className="settings__row-sub">Notify when plants need water</p>
            </div>
            <button
              className={`toggle${settings.notifications ? ' toggle--on' : ''}`}
              onClick={() => toggle('notifications')}
              aria-pressed={settings.notifications}
            >
              <span className="toggle__knob" />
            </button>
          </div>
        </div>

        {/* Sky theme override */}
        <div className="settings__row" style={{ padding: '0 0 .5rem', flexDirection: 'column', alignItems: 'flex-start', gap: '.4rem' }}>
          <div>
            <p className="settings__row-title">Sky Theme</p>
            <p className="settings__row-sub">
              {currentOverride ? `Locked to ${THEMES[currentOverride].label}` : 'Auto (time of day)'}
            </p>
          </div>
          <div className="theme-picker">
            {/* Auto tile */}
            <button
              className={`theme-tile theme-tile--auto${!currentOverride ? ' theme-tile--active' : ''}`}
              onClick={() => setThemeOverride(null)}
            >
              <span className="theme-tile__icon">🔄</span>
              <span className="theme-tile__label">Auto</span>
            </button>
            {THEME_LIST.map(t => (
              <button
                key={t}
                className={`theme-tile${currentOverride === t ? ' theme-tile--active' : ''}`}
                style={{ background: TILE_BG[t] }}
                onClick={() => setThemeOverride(t)}
              >
                <span className="theme-tile__icon">{TILE_EMOJI[t]}</span>
                <span className="theme-tile__label">{THEMES[t].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings__about">
          <p>🌿 A New Leaf</p>
          <p className="settings__version">v0.2.0 — Local build</p>
        </div>
      </div>
    </div>
  );
}
