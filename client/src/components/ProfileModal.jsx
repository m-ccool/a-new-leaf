import { useState } from 'react';
import { usePlants } from '../context/PlantContext';
import { MODELS } from '../hooks/usePlantAPI';
import PlantViewer from './PlantViewer';

export default function ProfileModal({ onClose }) {
  const { plants, user, setUser, getWaterLevel } = usePlants();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [modelIdx, setModelIdx] = useState(user.avatarModelIdx ?? 0);

  const needsWater = plants.filter(p => getWaterLevel(p) < 30).length;

  const prevSkin = () => setModelIdx(i => (i - 1 + MODELS.length) % MODELS.length);
  const nextSkin = () => setModelIdx(i => (i + 1) % MODELS.length);

  function handleSave(e) {
    e.preventDefault();
    setUser({ ...user, name: name.trim() || 'Plant Parent', bio: bio.trim(), avatarModelIdx: modelIdx });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--center" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="profile__avatar-wrap">
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

          <div className="profile__stats">
            <div className="profile__stat">
              <span className="profile__stat-value">{plants.length}</span>
              <span className="profile__stat-label">Plants</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-value" style={{ color: needsWater > 0 ? 'var(--red)' : 'var(--green)' }}>
                {needsWater}
              </span>
              <span className="profile__stat-label">Need Water</span>
            </div>
            <div className="profile__stat">
              <span className="profile__stat-value">{plants.length - needsWater}</span>
              <span className="profile__stat-label">Thriving</span>
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
