import { Dialog, DialogPanel, Switch } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import { THEME_LIST, THEMES, useTimeTheme } from '../hooks/useTimeTheme';

// Theme tile backgrounds + animations are defined entirely in CSS
// (.theme-tile--dawn, .theme-tile--morning, etc.)

export default function SettingsModal({ open, onClose, onUpgrade }) {
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
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal modal--center">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
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
            <Switch
              checked={!!settings.darkMode}
              onChange={() => toggle('darkMode')}
              className={`toggle${settings.darkMode ? ' toggle--on' : ''}`}
            >
              <span className="toggle__knob" />
            </Switch>
          </div>

          <div className="settings__row">
            <div>
              <p className="settings__row-title">Watering Reminders</p>
              <p className="settings__row-sub">Notify when plants need water</p>
            </div>
            <Switch
              checked={!!settings.notifications}
              onChange={() => toggle('notifications')}
              className={`toggle${settings.notifications ? ' toggle--on' : ''}`}
            >
              <span className="toggle__knob" />
            </Switch>
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
            <button
              className={`theme-tile theme-tile--auto${!currentOverride ? ' theme-tile--active' : ''}`}
              onClick={() => setThemeOverride(null)}
            >
              <span className="theme-tile__label">Auto</span>
            </button>
            {THEME_LIST.map(t => (
              <button
                key={t}
                className={`theme-tile theme-tile--${t}${currentOverride === t ? ' theme-tile--active' : ''}${!currentOverride && autoName === t ? ' theme-tile--current' : ''}`}
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
      </DialogPanel>
    </Dialog>
  );
}
