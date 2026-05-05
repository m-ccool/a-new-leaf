import PlantViewer from './PlantViewer';
import { usePlants } from '../context/PlantContext';

function waterBarClass(pct) {
  if (pct > 50) return 'plant-card__bar-fill--water-high';
  if (pct > 25) return 'plant-card__bar-fill--water-mid';
  return 'plant-card__bar-fill--water-low';
}

function statusDotClass(waterPct) {
  if (waterPct > 50) return 'plant-card__status-dot--ok';
  if (waterPct > 20) return 'plant-card__status-dot--warn';
  return 'plant-card__status-dot--critical';
}

export default function PlantCard({ plant, onCardClick }) {
  const { getWaterLevel, getHappyLevel, getAge } = usePlants();

  const waterPct = Math.round(getWaterLevel(plant));
  const happyPct = Math.round(getHappyLevel(plant));

  return (
    <div className="plant-card" onClick={() => onCardClick(plant)}>
      <div className="plant-card__model">
        <span className={`plant-card__status-dot ${statusDotClass(waterPct)}`} />
        <PlantViewer modelUrl={plant.species.model} height={180} />
      </div>

      <div className="plant-card__info">
        <p className="plant-card__age">{getAge(plant)}</p>
        <h3 className="plant-card__name">{plant.nickname}</h3>
        <p className="plant-card__species">
          {plant.species.name.toUpperCase()}
          {plant.species.latin ? ` · ${plant.species.latin.toUpperCase()}` : ''}
        </p>

        <div className="plant-card__bars">
          <span className="plant-card__bar-icon">💧</span>
          <div className="plant-card__bar-track">
            <div
              className={`plant-card__bar-fill ${waterBarClass(waterPct)}`}
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <span className="plant-card__bar-icon">😊</span>
          <div className="plant-card__bar-track">
            <div
              className="plant-card__bar-fill plant-card__bar-fill--happy"
              style={{ width: `${happyPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

