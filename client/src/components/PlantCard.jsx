import { useState, useEffect, useRef, Suspense } from 'react';
import PlantViewer from './PlantViewer';
import { usePlants } from '../context/PlantContext';
import { getPlantPersonality } from '../hooks/usePlantAPI';

function formatNextWatering(plant) {
  if (!plant.lastWatered) return null;
  const freqMs = (plant.species?.waterFreqDays ?? 7) * 24 * 3600 * 1000;
  const msLeft = (plant.lastWatered + freqMs) - Date.now();
  if (msLeft <= 0) return 'overdue';
  const mins = Math.floor(msLeft / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(msLeft / 3600000);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(msLeft / 86400000);
  if (days === 1) return 'tomorrow';
  return `${days}d`;
}

function waterBarClass(pct) {
  if (pct > 30) return 'plant-card__bar-fill--water-high';
  if (pct > 15) return 'plant-card__bar-fill--water-mid';
  return 'plant-card__bar-fill--water-low';
}

function happyBarClass(pct) {
  if (pct > 60) return 'plant-card__bar-fill--happy-high';
  if (pct > 30) return 'plant-card__bar-fill--happy-mid';
  return 'plant-card__bar-fill--happy-low';
}

function statusDotClass(pct) {
  if (pct > 50) return 'plant-card__status-dot--ok';
  if (pct > 20) return 'plant-card__status-dot--warn';
  return 'plant-card__status-dot--critical';
}

export default function PlantCard({ plant, onCardClick, onLearn }) {
  const { getWaterLevel, getHappyLevel, waterPlant } = usePlants();
  const waterPct = Math.round(getWaterLevel(plant));
  const happyPct = Math.round(getHappyLevel(plant));

  const [overfill, setOverfill] = useState(false);
  const prevWateredRef = useRef(plant.lastWatered);

  useEffect(() => {
    if (plant.lastWatered !== prevWateredRef.current) {
      prevWateredRef.current = plant.lastWatered;
      setOverfill(true);
      const t = setTimeout(() => setOverfill(false), 700);
      return () => clearTimeout(t);
    }
  }, [plant.lastWatered]);

  const nextLabel = formatNextWatering(plant);
  const isOverdue = nextLabel === 'overdue';
  const mood = happyPct > 70 ? 'happy' : happyPct < 35 ? 'sad' : 'ok';
  const personality = getPlantPersonality(plant.species);

  return (
    <div className="plant-card" data-mood={mood} onClick={() => onCardClick(plant)}>
      <div className="plant-card__model">
        <span className={`plant-card__status-dot ${statusDotClass(waterPct)}`} />
        <Suspense fallback={<div className="skeleton skeleton-model" />}>
          <PlantViewer modelUrl={plant.species.model} height={180} />
        </Suspense>
      </div>

      <div className="plant-card__info">
        <h3 className="plant-card__name">{plant.nickname}</h3>
        <span className="plant-card__personality">{personality.emoji} {personality.label}</span>

        <div className="plant-card__bars">
          <div className={`plant-card__bar-track${overfill ? ' plant-card__bar-track--overfill' : ''}`}>
            <div
              className={`plant-card__bar-fill ${waterBarClass(waterPct)}${overfill ? ' plant-card__bar-fill--overfill' : ''}`}
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <div className="plant-card__bar-track plant-card__bar-track--happy">
            <div
              className={`plant-card__bar-fill ${happyBarClass(happyPct)}`}
              style={{ width: `${happyPct}%` }}
            />
          </div>
        </div>

        {nextLabel && (
          <p className={`plant-card__watered${isOverdue ? ' plant-card__watered--critical' : ''}`}>
            💧 {isOverdue ? 'overdue' : nextLabel}
          </p>
        )}
      </div>
      <button
        className="plant-card__water-quick-btn"
        onClick={e => { e.stopPropagation(); waterPlant(plant.id); }}
        aria-label={`Water ${plant.nickname}`}
      >
        💧
      </button>
    </div>
  );
}
