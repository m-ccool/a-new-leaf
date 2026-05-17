import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import ShareCard from './ShareCard';

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function gradeColor(grade) {
  return grade === 'A' ? 'var(--green)'
    : grade === 'B' ? 'var(--accent)'
    : grade === 'C' ? 'var(--amber)'
    : grade === 'D' ? '#fb923c'
    : 'var(--red)';
}

export default function StatsModal({ open, onClose, onOpenSubscription }) {
  const { plants, getHappyLevel, user, events, getGardenGrade } = usePlants();

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

  // Last 7 days watering activity
  const allWaterEvents = Object.values(events).flat().filter(e => e.type === 'watered');
  const last7 = Array(7).fill(0);
  allWaterEvents.forEach(e => {
    const daysAgo = Math.floor((Date.now() - e.timestamp) / 86400000);
    if (daysAgo >= 0 && daysAgo < 7) last7[6 - daysAgo]++;
  });
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
              {last7.map((count, i) => (
                <div key={i} className="stats-modal__bar-col">
                  <div className="stats-modal__bar-track">
                    <div
                      className="stats-modal__bar-fill"
                      style={{ height: `${Math.max(count / maxBars, count > 0 ? 0.1 : 0) * 100}%` }}
                    />
                  </div>
                  <span className="stats-modal__bar-day">{dayLabels[i]}</span>
                </div>
              ))}
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

          {/* Share Card — Pro-gated */}
          <ShareCard open={open} onOpenSubscription={onOpenSubscription} />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
