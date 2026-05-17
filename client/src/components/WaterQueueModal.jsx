import { useState, useMemo } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import LockBadge from './LockBadge';

function urgencyScore(plant, weatherTemp) {
  const freq  = plant.species?.waterFreqDays ?? 7;
  const elapsed = (Date.now() - (plant.lastWatered ?? 0)) / 86400000; // days
  let score = (elapsed - freq) / freq;
  if (weatherTemp != null && weatherTemp > 80) score *= 1.15;
  return score;
}

function urgencyLabel(score) {
  if (score >= 0.5) return { text: 'Overdue', cls: 'wq-row__badge--red' };
  if (score >= 0)   return { text: 'Due today', cls: 'wq-row__badge--amber' };
  return { text: 'Upcoming', cls: 'wq-row__badge--green' };
}

export default function WaterQueueModal({ open, onClose, onOpenSubscription }) {
  const { plants, waterPlant, settings, weather } = usePlants();
  const isPro = settings?.isPro ?? false;
  const temp  = weather?.temp ?? null;

  const [watered, setWatered] = useState(new Set());

  const sorted = useMemo(() => {
    return [...plants]
      .map(p => ({ plant: p, score: urgencyScore(p, temp) }))
      .sort((a, b) => b.score - a.score);
  }, [plants, temp]);

  const visible = isPro ? sorted : sorted.slice(0, 1);
  const blurred = isPro ? [] : sorted.slice(1);

  const overduePlants = sorted.filter(({ score }) => score >= 0);

  function handleWater(plantId) {
    waterPlant(plantId);
    setWatered(prev => new Set(prev).add(plantId));
  }

  function handleWaterAll() {
    overduePlants.forEach(({ plant }) => {
      if (!watered.has(plant.id)) handleWater(plant.id);
    });
  }

  return (
    <Dialog open={open} onClose={onClose} className="modal-overlay">
      <div className="modal-backdrop" aria-hidden="true" />
      <DialogPanel className="modal-sheet wq-sheet">
        <div className="wq-header">
          <div>
            <h2 className="wq-title">💧 Water Queue</h2>
            <p className="wq-sub">
              {overduePlants.length === 0
                ? 'All plants are happy!'
                : `${overduePlants.length} plant${overduePlants.length > 1 ? 's' : ''} need${overduePlants.length === 1 ? 's' : ''} attention`}
            </p>
          </div>
          {isPro && overduePlants.length > 0 && (
            <button className="btn btn--primary wq-water-all" onClick={handleWaterAll}>
              Water All
            </button>
          )}
        </div>

        <div className="wq-list">
          {visible.map(({ plant, score }) => {
            const done   = watered.has(plant.id);
            const { text, cls } = urgencyLabel(score);
            return (
              <div
                key={plant.id}
                className={`wq-row${done ? ' wq-row--done' : ''}`}
              >
                <div className="wq-row__info">
                  <p className="wq-row__name">{plant.nickname}</p>
                  <p className="wq-row__species">{plant.species?.name}</p>
                </div>
                <span className={`wq-row__badge ${cls}`}>{text}</span>
                <button
                  className="btn btn--primary wq-row__btn"
                  onClick={() => handleWater(plant.id)}
                  disabled={done}
                  aria-label={`Water ${plant.nickname}`}
                >
                  {done ? '✓' : '💧'}
                </button>
              </div>
            );
          })}

          {blurred.length > 0 && (
            <div className="wq-locked-overlay">
              {blurred.slice(0, 3).map(({ plant, score }) => {
                const { text, cls } = urgencyLabel(score);
                return (
                  <div key={plant.id} className="wq-row wq-row--blurred" aria-hidden="true">
                    <div className="wq-row__info">
                      <p className="wq-row__name">{plant.nickname}</p>
                      <p className="wq-row__species">{plant.species?.name}</p>
                    </div>
                    <span className={`wq-row__badge ${cls}`}>{text}</span>
                    <button className="btn btn--primary wq-row__btn" disabled>💧</button>
                  </div>
                );
              })}
              <div className="wq-lock-gate">
                <LockBadge onUnlock={onOpenSubscription} />
                <p className="wq-lock-label">Pro unlocks full queue</p>
              </div>
            </div>
          )}

          {sorted.length === 0 && (
            <p className="wq-empty">Add some plants to get started!</p>
          )}
        </div>

        <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
      </DialogPanel>
    </Dialog>
  );
}
