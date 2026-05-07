import { usePlants } from '../context/PlantContext';
import { THEME_LIST, THEMES, useTimeTheme } from '../hooks/useTimeTheme';

// Gradient previews for each theme tile
const TILE_BG = {
  dawn:      'linear-gradient(145deg, #2d1b69 0%, #8b3f7e 40%, #f2a06a 100%)',
  morning:   'linear-gradient(145deg, #5ca8e0 0%, #93c5fd 55%, #dbeafe 100%)',
  midday:    'linear-gradient(145deg, #3ba9d8 0%, #5fc4f0 45%, #c5eaf8 100%)',
  afternoon: 'linear-gradient(145deg, #8dd6f7 0%, #d8c2f5 45%, #f4a06a 100%)',
  dusk:      'linear-gradient(145deg, #0d0c2b 0%, #3730a3 40%, #a89fdd 100%)',
  night:     'linear-gradient(145deg, #02020e 0%, #0a0d28 45%, #1e1b4b 100%)',
};

export default function SettingsModal({ onClose, onUpgrade }) {
  const { settings, setSettings } = usePlants();
  const autoTheme = useTimeTheme(null);

  function toggle(key) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function setThemeOverride(t) {
    setSettings(prev => ({ ...prev, themeOverride: t }));
  }

  const currentOverride = settings.themeOverride ?? null;
  const autoName = autoTheme.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--center" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal__title">Settings</h2>

        {!settings.isPro && (
          <button
            className="settings__upgrade-row"
            onClick={() => { onClose(); onUpgrade?.(); }}
          >
            <span>🌟 Upgrade to Pro</span>
            <span className="settings__upgrade-caret">›</span>
          </button>
        )}

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
              <span className="theme-tile__label">Auto</span>
            </button>
            {THEME_LIST.map(t => (
              <button
                key={t}
                className={`theme-tile${currentOverride === t ? ' theme-tile--active' : ''}${!currentOverride && autoName === t ? ' theme-tile--current' : ''}`}
                style={{ background: TILE_BG[t] }}
                onClick={() => setThemeOverride(t)}
              >
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
