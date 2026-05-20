import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import ShareCard from './ShareCard';
import LockBadge from './LockBadge';

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function urgencyScore(plant, temp) {
  const freq    = plant.species?.waterFreqDays ?? 7;
  const elapsed = (Date.now() - (plant.lastWatered ?? 0)) / 86400000;
  let score = (elapsed - freq) / freq;
  if (temp != null && temp > 80) score *= 1.15;
  return score;
}

function urgencyLabel(score) {
  if (score >= 0.5) return { text: 'Overdue',   cls: 'wq-row__badge--red' };
  if (score >= 0)   return { text: 'Due today', cls: 'wq-row__badge--amber' };
  return                   { text: 'Upcoming',  cls: 'wq-row__badge--green' };
}

function gradeColor(grade) {
  return grade === 'A' ? 'var(--green)'
    : grade === 'B' ? 'var(--accent)'
    : grade === 'C' ? 'var(--amber)'
    : grade === 'D' ? '#fb923c'
    : 'var(--red)';
}

export default function StatsModal({ open, onClose, onOpenSubscription }) {
  const { plants, getHappyLevel, user, events, getGardenGrade, waterPlant, settings, weather } = usePlants();
  const isPro = settings?.isPro ?? false;
  const temp  = weather?.temp ?? null;

  // Water queue state
  const [watered, setWatered] = useState(new Set());

  function handleWater(plantId) {
    waterPlant(plantId);
    setWatered(prev => new Set(prev).add(plantId));
  }

  const grade  = getGardenGrade();
  const streak = user?.streak ?? 0;
  const color  = gradeColor(grade);

  // Water consistency — plants watered within their frequency window
  const consistent = plants.filter(p => {
    const freqMs = (p.species?.waterFreqDays ?? 7) * 86400000;
    return p.lastWatered && (Date.now() - p.lastWatered) < freqMs;
  }).length;
  const consistencyScore = plants.length > 0 ? Math.round((consistent / plants.length) * 100) : 0;

  // Health breakdown
  const healthy = plants.filter(p => getHappyLevel(p) >= 60).length;
  const okay    = plants.filter(p => { const h = getHappyLevel(p); return h >= 30 && h < 60; }).length;
  const thirsty = plants.filter(p => getHappyLevel(p) < 30).length;

  // Last 7 days watering activity — primary: events log; fallback: lastWatered timestamps
  const allWaterEvents = Object.values(events).flat().filter(e => e.type === 'watered');
  const last7 = Array(7).fill(0);
  if (allWaterEvents.length > 0) {
    allWaterEvents.forEach(e => {
      const daysAgo = Math.floor((Date.now() - e.timestamp) / 86400000);
      if (daysAgo >= 0 && daysAgo < 7) last7[6 - daysAgo]++;
    });
  } else {
    plants.forEach(p => {
      if (!p.lastWatered) return;
      const daysAgo = Math.floor((Date.now() - p.lastWatered) / 86400000);
      if (daysAgo >= 0 && daysAgo < 7) last7[6 - daysAgo]++;
    });
  }
  const maxBars = Math.max(...last7, 1);

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return DAY_INITIALS[d.getDay()];
  });

  // Most cared-for plant
  const mostCared = plants.length > 0
    ? plants.map(p => ({ plant: p, count: events[p.id]?.length ?? 0 }))
        .sort((a, b) => b.count - a.count)[0]
    : null;

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal stats-modal">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="stats-modal__body">
          {/* Hero — grade ring + KPI trio */}
          <div className="stats-modal__hero">
            <div className="stats-modal__grade-ring" style={{ borderColor: color, boxShadow: `0 0 20px ${color}38` }}>
              <span className="stats-modal__grade-letter" style={{ color }}>{grade ?? '—'}</span>
              <span className="stats-modal__grade-sub">grade</span>
            </div>
            <div className="stats-modal__kpis">
              <div className="stats-modal__kpi">
                <span className="stats-modal__kpi-val">🔥 {streak}</span>
                <span className="stats-modal__kpi-label">day streak</span>
              </div>
              <div className="stats-modal__kpi">
                <span className="stats-modal__kpi-val">{consistencyScore}%</span>
                <span className="stats-modal__kpi-label">on schedule</span>
              </div>
              <div className="stats-modal__kpi">
                <span className="stats-modal__kpi-val">{plants.length}</span>
                <span className="stats-modal__kpi-label">plants</span>
              </div>
            </div>
          </div>

          {/* 7-day activity chart */}
          <div className="stats-modal__section">
            <p className="stats-modal__section-title">Watering — last 7 days</p>
            <div className="stats-modal__chart">
              {last7.map((count, i) => {
                const isFull = plants.length > 0 && count >= plants.length;
                return (
                  <div key={i} className="stats-modal__bar-col">
                    <div className="stats-modal__bar-track">
                      <div
                        className={`stats-modal__bar-fill${isFull ? ' stats-modal__bar-fill--full' : ''}`}
                        style={{ height: `${Math.max(count / maxBars, count > 0 ? 0.12 : 0) * 100}%` }}
                      />
                    </div>
                    <span className={`stats-modal__bar-day${i === 6 ? ' stats-modal__bar-day--today' : ''}`}>
                      {dayLabels[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plant health breakdown */}
          {plants.length > 0 && (
            <div className="stats-modal__section">
              <p className="stats-modal__section-title">Plant Health</p>
              <div className="stats-modal__health-chips">
                <div className="stats-modal__health-chip stats-modal__health-chip--happy">
                  <span className="stats-modal__hc-count">{healthy}</span>
                  <span className="stats-modal__hc-label">😊 Happy</span>
                </div>
                <div className="stats-modal__health-chip stats-modal__health-chip--okay">
                  <span className="stats-modal__hc-count">{okay}</span>
                  <span className="stats-modal__hc-label">😐 Okay</span>
                </div>
                <div className="stats-modal__health-chip stats-modal__health-chip--thirsty">
                  <span className="stats-modal__hc-count">{thirsty}</span>
                  <span className="stats-modal__hc-label">😟 Thirsty</span>
                </div>
              </div>
              <div className="stats-modal__health-bar">
                {healthy > 0 && <div className="stats-modal__health-seg stats-modal__health-seg--happy"  style={{ flex: healthy }} />}
                {okay    > 0 && <div className="stats-modal__health-seg stats-modal__health-seg--okay"   style={{ flex: okay    }} />}
                {thirsty > 0 && <div className="stats-modal__health-seg stats-modal__health-seg--thirsty" style={{ flex: thirsty }} />}
              </div>
            </div>
          )}

          {/* Most cared-for plant */}
          {mostCared && mostCared.count > 0 && (
            <div className="stats-modal__section">
              <p className="stats-modal__section-title">Most Cared For</p>
              <div className="stats-modal__fav">
                <span className="stats-modal__fav-icon">🌟</span>
                <div>
                  <span className="stats-modal__fav-name">{mostCared.plant.nickname}</span>
                  <span className="stats-modal__fav-meta">{mostCared.plant.species?.name} · {mostCared.count} events</span>
                </div>
              </div>
            </div>
          )}

          {plants.length === 0 && (
            <p className="stats-modal__empty">Add plants to start tracking your garden stats.</p>
          )}

          {/* Water Queue — inline, Pro gate shows 1 free */}
          {plants.length > 0 && (() => {
            const sorted = [...plants]
              .map(p => ({ plant: p, score: urgencyScore(p, temp) }))
              .sort((a, b) => b.score - a.score);
            const visible = isPro ? sorted : sorted.slice(0, 1);
            const locked  = isPro ? [] : sorted.slice(1);
            return (
              <div className="stats-modal__section">
                <p className="stats-modal__section-title">💧 Water Queue</p>
                <div className="stats-wq-list">
                  {visible.map(({ plant, score }) => {
                    const done = watered.has(plant.id);
                    const { text, cls } = urgencyLabel(score);
                    return (
                      <div key={plant.id} className={`wq-row${done ? ' wq-row--done' : ''}`}>
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
                        >{done ? '\u2713' : '\uD83D\uDCA7'}</button>
                      </div>
                    );
                  })}
                  {locked.length > 0 && (
                    <div className="wq-locked-inline">
                      <LockBadge onUnlock={onOpenSubscription} />
                      <p className="wq-lock-label">Pro unlocks full queue ({locked.length} more)</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Share Card — Pro-gated */}
          <ShareCard open={open} onOpenSubscription={onOpenSubscription} />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
