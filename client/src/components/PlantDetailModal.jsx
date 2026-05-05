import PlantViewer from './PlantViewer';
import { usePlants } from '../context/PlantContext';

function waterBarClass(pct) {
  if (pct > 50) return 'plant-card__bar-fill--water-high';
  if (pct > 25) return 'plant-card__bar-fill--water-mid';
  return 'plant-card__bar-fill--water-low';
}

export default function PlantDetailModal({ plant, onClose }) {
  const { getWaterLevel, getHappyLevel, getAge, waterPlant, removePlant } = usePlants();

  const waterPct = Math.round(getWaterLevel(plant));
  const happyPct = Math.round(getHappyLevel(plant));

  function handleWater() {
    waterPlant(plant.id);
  }

  function handleDelete() {
    if (window.confirm(`Remove ${plant.nickname}?`)) {
      removePlant(plant.id);
      onClose();
    }
  }

  return (
    <div className="modal-overlay plant-detail-overlay" onClick={onClose}>
      <div className="modal plant-detail" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        {/* 3D model */}
        <div className="plant-detail__viewer">
          <PlantViewer modelUrl={plant.species.model} height={260} />
        </div>

        {/* Identity */}
        <div className="plant-detail__identity">
          <p className="plant-detail__age">{getAge(plant)}</p>
          <h2 className="plant-detail__name">{plant.nickname}</h2>
          <p className="plant-detail__species">
            {plant.species.name}
            {plant.species.latin ? <em> · {plant.species.latin}</em> : ''}
          </p>
        </div>

        {/* Status bars */}
        <div className="plant-detail__bars">
          <div className="plant-detail__bar-row">
            <span className="plant-detail__bar-label">💧 Water</span>
            <span className="plant-detail__bar-pct">{waterPct}%</span>
          </div>
          <div className="plant-card__bar-track plant-detail__bar-track">
            <div
              className={`plant-card__bar-fill ${waterBarClass(waterPct)}`}
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <div className="plant-detail__bar-row">
            <span className="plant-detail__bar-label">😊 Happy</span>
            <span className="plant-detail__bar-pct">{happyPct}%</span>
          </div>
          <div className="plant-card__bar-track plant-detail__bar-track">
            <div
              className="plant-card__bar-fill plant-card__bar-fill--happy"
              style={{ width: `${happyPct}%` }}
            />
          </div>
        </div>

        {/* Care info */}
        <div className="plant-detail__care">
          <div className="plant-detail__care-item">
            <span className="plant-detail__care-icon">☀️</span>
            <span className="plant-detail__care-label">Light</span>
            <span className="plant-detail__care-val">{plant.species.light}</span>
          </div>
          <div className="plant-detail__care-item">
            <span className="plant-detail__care-icon">🌡️</span>
            <span className="plant-detail__care-label">Temp</span>
            <span className="plant-detail__care-val">{plant.species.temp}</span>
          </div>
          <div className="plant-detail__care-item">
            <span className="plant-detail__care-icon">🚿</span>
            <span className="plant-detail__care-label">Water</span>
            <span className="plant-detail__care-val">every ~{plant.species.waterFreqDays ?? 7}d</span>
          </div>
        </div>

        {plant.species.water && (
          <p className="plant-detail__water-note">{plant.species.water}</p>
        )}

        {plant.species.toxic && (
          <p className="plant-card__toxic">⚠️ TOXIC TO CATS &amp; DOGS</p>
        )}

        {/* Actions */}
        <div className="plant-detail__actions">
          <button className="btn btn--primary plant-detail__water-btn" onClick={handleWater}>
            💧 Water Now
          </button>
          <button className="btn plant-detail__delete-btn" onClick={handleDelete}>
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  );
}
