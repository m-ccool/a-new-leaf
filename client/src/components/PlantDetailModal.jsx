import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import PlantViewer from './PlantViewer';
import LockBadge from './LockBadge';
import { usePlants } from '../context/PlantContext';
import { getSpeciesDetails, hasApiKey } from '../hooks/usePlantAPI';

function waterBarClass(pct) {
  if (pct > 30) return 'plant-card__bar-fill--water-high';
  if (pct > 15) return 'plant-card__bar-fill--water-mid';
  return 'plant-card__bar-fill--water-low';
}

function happyBarClass(pct) {
  if (pct > 30) return 'plant-card__bar-fill--happy-high';
  if (pct > 15) return 'plant-card__bar-fill--happy-mid';
  return 'plant-card__bar-fill--happy-low';
}

function weatherLightLabel(code) {
  if (code == null) return null;
  if (code <= 1) return '☀️ clear';
  if (code <= 3) return '⛅ partly';
  return '☁️ overcast';
}

function formatNextWatering(plant) {
  if (!plant.lastWatered) return null;
  const freqMs = (plant.species?.waterFreqDays ?? 7) * 24 * 3600 * 1000;
  const msLeft = (plant.lastWatered + freqMs) - Date.now();
  if (msLeft <= 0) return 'overdue';
  const mins = Math.floor(msLeft / 60000);
  if (mins < 60) return `next watering: ${mins}m`;
  const hrs = Math.floor(msLeft / 3600000);
  if (hrs < 24) return `next watering: ${hrs}h`;
  const days = Math.floor(msLeft / 86400000);
  if (days === 1) return 'next watering: tomorrow';
  return `next watering: in ${days}d`;
}

export default function PlantDetailModal({ open, plant: plantProp, onClose, onLearn, onCheckup, onOpenSubscription }) {
  const { plants, getWaterLevel, getHappyLevel, waterPlant, removePlant, weather, settings, photos, setPlantPhoto, removePlantPhoto } = usePlants();

  // Use live plant from context so bars update instantly after watering
  const plant = plants.find(p => p.id === plantProp.id) ?? plantProp;

  const waterPct = Math.round(getWaterLevel(plant));
  const happyPct = Math.round(getHappyLevel(plant));

  // Stat hint strings for bar rows
  const waterFreqDays = plant.species?.waterFreqDays ?? 7;
  const waterStat = `${waterPct}% · every ${waterFreqDays}d cycle`;

  const idealTemp = parseInt(String(plant.species?.temp ?? '70').replace(/[^\d]/g, ''), 10) || 70;
  const liveTemp  = weather?.temp != null ? `${Math.round(weather.temp)}°` : null;
  const lightPref = plant.species?.light ?? null;
  const lightNow  = weather ? weatherLightLabel(weather.code) : null;
  const happyStat = liveTemp
    ? `🌡️ ${liveTemp} / ${idealTemp}° ideal  ·  ${lightNow ?? ''}${lightPref ? `  vs  ${lightPref}` : ''}`
    : lightPref ? `☀️ prefers: ${lightPref}` : null;

  // Overfill animation on water bar
  const [overfill, setOverfill] = useState(false);
  const prevWateredRef = useRef(plant.lastWatered);

  // Photo journal
  const photoRef = useRef(null);
  const plantPhoto = photos?.[plant.id] ?? null;
  const isPro = settings?.isPro ?? false;

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      setPlantPhoto(plant.id, canvas.toDataURL('image/jpeg', 0.75));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = '';
  }

  useEffect(() => {
    if (plant.lastWatered !== prevWateredRef.current) {
      prevWateredRef.current = plant.lastWatered;
      setOverfill(true);
      const t = setTimeout(() => setOverfill(false), 700);
      return () => clearTimeout(t);
    }
  }, [plant.lastWatered]);

  function handleWater() {
    waterPlant(plant.id);
  }

  function handleDelete() {
    if (window.confirm(`Remove ${plant.nickname}?`)) {
      removePlant(plant.id);
      onClose();
    }
  }

  const nextLabel   = formatNextWatering(plant);
  const isOverdue   = nextLabel === 'overdue';

  // Fetch live details from Perenual for API-sourced plants (id starts with "api-")
  const isApiPlant = hasApiKey &&
    typeof plant.species.id === 'string' && plant.species.id.startsWith('api-');
  const [apiDetails, setApiDetails] = useState(null);
  const [apiLoading, setApiLoading] = useState(isApiPlant);

  useEffect(() => {
    if (!isApiPlant) return;
    const numericId = parseInt(plant.species.id.replace('api-', ''), 10);
    if (!numericId) { setApiLoading(false); return; }
    let cancelled = false;
    getSpeciesDetails(numericId).then(data => {
      if (!cancelled) {
        setApiDetails(data ?? null);
        setApiLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [plant.species.id, isApiPlant]);

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay plant-detail-overlay">
      <DialogPanel className="modal plant-detail">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        {/* 3D model — full-bleed transparent window */}
        <div className="plant-detail__viewer">
          <PlantViewer modelUrl={plant.species.model} height={300} />
        </div>

        {/* Identity */}
        <div className="plant-detail__identity">
          <h2 className="plant-detail__name">{plant.nickname}</h2>
          <p className="plant-detail__species">
            {plant.species.name}
            {plant.species.latin ? <em> · {plant.species.latin}</em> : ''}
          </p>
          {nextLabel && (
            <p className={`plant-card__watered${isOverdue ? ' plant-card__watered--critical' : ''} plant-detail__watered`}>
              💧 {nextLabel}
            </p>
          )}
          {plant.species.toxic && (
            <p className="plant-card__toxic">⚠️ Toxic to cats &amp; dogs</p>
          )}
        </div>

        {/* Status bars — glass section card */}
        <div className="plant-detail__section">
          <div className="plant-detail__section-pad plant-detail__bars">
            <div className="plant-detail__bar-row">
              <span className="plant-detail__bar-label">💧 Water</span>
              <span className="plant-detail__bar-pct">{waterPct}%</span>
            </div>
            <div className={`plant-card__bar-track plant-detail__bar-track${overfill ? ' plant-card__bar-track--overfill' : ''}`}>
              <div
                className={`plant-card__bar-fill ${waterBarClass(waterPct)}${overfill ? ' plant-card__bar-fill--overfill' : ''}`}
                style={{ width: `${waterPct}%` }}
              />
            </div>
            {waterStat && <p className="plant-detail__bar-stat">{waterStat}</p>}
            <div className="plant-detail__bar-row">
              <span className="plant-detail__bar-label">😊 Happy</span>
              <span className="plant-detail__bar-pct">{happyPct}%</span>
            </div>
            <div className={`plant-card__bar-track plant-card__bar-track--happy plant-detail__bar-track${overfill ? ' plant-card__bar-track--overfill' : ''}`}>
              <div
                className={`plant-card__bar-fill ${happyBarClass(happyPct)}${overfill ? ' plant-card__bar-fill--overfill' : ''}`}
                style={{ width: `${happyPct}%` }}
              />
            </div>
            {happyStat && <p className="plant-detail__bar-stat" style={{ marginBottom: 0 }}>{happyStat}</p>}
          </div>
        </div>

        {/* Care info — glass section card */}
        <div className="plant-detail__section">
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
            {isApiPlant && (
              <div className="plant-detail__care-item">
                <span className="plant-detail__care-icon">🌱</span>
                <span className="plant-detail__care-label">Care</span>
                {apiLoading
                  ? <span className="skeleton skeleton-line plant-detail__care-skel" />
                  : <span className="plant-detail__care-val">{apiDetails?.care_level ?? '—'}</span>}
              </div>
            )}
            {isApiPlant && (
              <div className="plant-detail__care-item">
                <span className="plant-detail__care-icon">📈</span>
                <span className="plant-detail__care-label">Growth</span>
                {apiLoading
                  ? <span className="skeleton skeleton-line plant-detail__care-skel" />
                  : <span className="plant-detail__care-val">{apiDetails?.growth_rate ?? '—'}</span>}
              </div>
            )}
          </div>

          {/* Water / description note inside section */}
          {(plant.species.water || (isApiPlant && !apiLoading && apiDetails?.description)) && (
            <>
              <div className="plant-detail__divider" />
              {isApiPlant && !apiLoading && apiDetails?.description && (
                <p className="plant-detail__water-note" style={{ fontStyle: 'italic' }}>
                  {apiDetails.description.length > 200
                    ? apiDetails.description.slice(0, 200) + '…'
                    : apiDetails.description}
                </p>
              )}
              {plant.species.water && (
                <p className="plant-detail__water-note">{plant.species.water}</p>
              )}
            </>
          )}
          {isApiPlant && apiLoading && (
            <><div className="plant-detail__divider" /><div className="skeleton plant-detail__desc-skel" style={{ margin: '.6rem .9rem' }} /></>
          )}
        </div>

        {/* Photo journal — Pro-gated */}
        <div className="plant-detail__section plant-detail__photo-section">
          {isPro ? (
            <>
              {plantPhoto ? (
                <div className="plant-detail__photo-wrap">
                  <img
                    className="plant-detail__photo"
                    src={plantPhoto.dataUrl}
                    alt={plant.nickname}
                  />
                  <div className="plant-detail__photo-actions">
                    <button className="btn plant-detail__photo-btn" onClick={() => photoRef.current?.click()}>
                      📷 Retake
                    </button>
                    <button className="btn plant-detail__photo-btn plant-detail__photo-btn--remove" onClick={() => removePlantPhoto(plant.id)}>
                      🗑 Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button className="plant-detail__photo-add" onClick={() => photoRef.current?.click()}>
                  <span className="plant-detail__photo-icon">📷</span>
                  <span className="plant-detail__photo-add-label">Add a photo</span>
                  <span className="plant-detail__photo-add-sub">Stored privately on your device</span>
                </button>
              )}
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </>
          ) : (
            <div className="plant-detail__photo-locked">
              <span className="plant-detail__photo-icon">📷</span>
              <span className="plant-detail__photo-locked-label">Photo Journal</span>
              <LockBadge onUnlock={onOpenSubscription} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="plant-detail__actions">
          <button className="btn btn--primary plant-detail__water-btn" onClick={handleWater}>
            💧 Water Now
          </button>
          {onCheckup && (
            <button className="btn plant-detail__checkup-btn" onClick={() => { onCheckup(plant); onClose(); }}>
              🩺 Checkup
            </button>
          )}
          {onLearn && plant.species?.perenualId && (
            <button className="btn plant-detail__learn-btn" onClick={() => { onLearn(plant); onClose(); }}>
              📖 Learn
            </button>
          )}
          <button className="btn plant-detail__delete-btn" onClick={handleDelete}>
            🗑 Remove
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
