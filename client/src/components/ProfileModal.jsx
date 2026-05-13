import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import { MODELS } from '../hooks/usePlantAPI';
import PlantViewer from './PlantViewer';

const ACCENTS = [
  { key: 'green',  color: '#52b788', label: 'Leaf' },
  { key: 'blue',   color: '#38bdf8', label: 'Sky'  },
  { key: 'rose',   color: '#fb7185', label: 'Rose' },
  { key: 'amber',  color: '#f59e0b', label: 'Sun'  },
  { key: 'purple', color: '#a78bfa', label: 'Plum' },
  { key: 'white',  color: '#f0f4f8', label: 'Frost'},
];

export default function ProfileModal({ open, onClose }) {
  const { plants, user, setUser, getWaterLevel, getGardenGrade } = usePlants();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [modelIdx, setModelIdx] = useState(user.avatarModelIdx ?? 0);
  const [accent, setAccent] = useState(user.accent ?? 'green');
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Custom color defaults to whatever the current accent is if it's a hex, else leaf green
  const [customColor, setCustomColor] = useState(() => {
    const a = user.accent ?? 'green';
    return a.startsWith('#') ? a : '#52b788';
  });
  const pickerRef = useRef(null);
  const btnRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;
    function handleClick(e) {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showColorPicker]);

  // accent can be a preset key ('green', 'blue', …) or a hex string ('#rrggbb')
  const accentColor = accent.startsWith('#')
    ? accent
    : (ACCENTS.find(a => a.key === accent)?.color ?? '#52b788');

  const needsWater = plants.filter(p => getWaterLevel(p) < 30).length;
  const thriving = plants.length - needsWater;
  const grade = getGardenGrade();
  const streak = user.streak ?? 0;

  const prevSkin = () => setModelIdx(i => (i - 1 + MODELS.length) % MODELS.length);
  const nextSkin = () => setModelIdx(i => (i + 1) % MODELS.length);

  function handleSave(e) {
    e.preventDefault();
    setUser({ ...user, name: name.trim() || 'Plant Parent', bio: bio.trim(), avatarModelIdx: modelIdx, accent });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal modal--center" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        <div className="profile__avatar-wrap" style={{ '--accent': accentColor }}>
          <div className="profile__avatar-model">
            <PlantViewer modelUrl={MODELS[modelIdx]} height={110} compact />
          </div>
          <div className="profile__skin-nav">
            <button type="button" className="profile__skin-btn" onClick={prevSkin} aria-label="Previous skin">‹</button>
            <span className="profile__skin-label">skin {modelIdx + 1}/{MODELS.length}</span>
            <button type="button" className="profile__skin-btn" onClick={nextSkin} aria-label="Next skin">›</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="modal__form">
          <label className="modal__label">
            Name
            <input
              className="modal__input"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
            />
          </label>

          <label className="modal__label">
            Bio
            <textarea
              className="modal__input modal__textarea"
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={120}
              rows={2}
            />
          </label>

          {/* Accent color picker */}
          <div className="profile__accent-wrap">
            <p className="modal__label" style={{ marginBottom: '.4rem' }}>Accent Color</p>
            <div className="profile__accent-row" style={{ position: 'relative' }}>
              {ACCENTS.map(a => (
                <button
                  key={a.key}
                  type="button"
                  className={`profile__accent-chip${accent === a.key ? ' profile__accent-chip--active' : ''}`}
                  style={{ '--chip-color': a.color }}
                  onClick={() => { setAccent(a.key); setShowColorPicker(false); }}
                  aria-label={a.label}
                  title={a.label}
                />
              ))}
              {/* Custom color "+" button */}
              <button
                type="button"
                ref={btnRef}
                className={`profile__accent-add${accent.startsWith('#') ? ' profile__accent-add--active' : ''}`}
                style={accent.startsWith('#') ? { background: accent, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.80)' } : {}}
                onClick={() => setShowColorPicker(v => !v)}
                aria-label="Custom color"
                title="Custom color"
              >
                {accent.startsWith('#') ? <span style={{ color: '#fff', fontSize: '.8rem', lineHeight: 1 }}>✓</span> : '+'}
              </button>
              {showColorPicker && (
                <div className="accent-picker-popup" ref={pickerRef}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={e => { setCustomColor(e.target.value); setAccent(e.target.value); }}
                    className="accent-picker-input"
                    aria-label="Pick custom accent color"
                  />
                  <span className="accent-picker-label">Custom color</span>
                  <button type="button" className="accent-picker-done" onClick={() => setShowColorPicker(false)}>Done</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile__stats">
            <div className="profile__stat">
              <span className="profile__stat-value">{plants.length}</span>
              <span className="profile__stat-label">Plants</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-value" style={{ color: thriving > 0 ? 'var(--green-mid)' : 'var(--text-muted)' }}>
                {thriving}
              </span>
              <span className="profile__stat-label">Thriving</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-value" style={{ color: streak > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                {streak > 0 ? `${streak}🔥` : '—'}
              </span>
              <span className="profile__stat-label">Streak</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-value" style={{ color: grade === 'A' ? 'var(--green-mid)' : grade === 'F' ? 'var(--red)' : 'var(--text)' }}>
                {grade ?? '—'}
              </span>
              <span className="profile__stat-label">Grade</span>
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Profile</button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
