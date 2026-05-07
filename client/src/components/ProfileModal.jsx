import { useState } from 'react';
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

export default function ProfileModal({ onClose }) {
  const { plants, user, setUser, getWaterLevel, getGardenGrade } = usePlants();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [modelIdx, setModelIdx] = useState(user.avatarModelIdx ?? 0);
  const [accent, setAccent] = useState(user.accent ?? 'green');

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

  const accentColor = ACCENTS.find(a => a.key === accent)?.color ?? '#52b788';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--center" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="profile__avatar-wrap" style={{ '--accent': accentColor }}>
          <div className="profile__avatar-model">
            <PlantViewer modelUrl={MODELS[modelIdx]} height={90} />
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
            <div className="profile__accent-row">
              {ACCENTS.map(a => (
                <button
                  key={a.key}
                  type="button"
                  className={`profile__accent-chip${accent === a.key ? ' profile__accent-chip--active' : ''}`}
                  style={{ '--chip-color': a.color }}
                  onClick={() => setAccent(a.key)}
                  aria-label={a.label}
                  title={a.label}
                />
              ))}
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
      </div>
    </div>
  );
}
