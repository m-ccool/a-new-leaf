import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import PlantViewer from './PlantViewer';
import LockBadge from './LockBadge';
import { usePlants } from '../context/PlantContext';
import { getSpeciesDetails, hasApiKey } from '../hooks/usePlantAPI';
import { SPECIES_CALENDAR, GENERIC_CALENDAR } from '../data/species';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getCalendarTip(plant, monthIdx) {
  const cal = SPECIES_CALENDAR[plant.species?.id];
  if (cal?.[monthIdx]) return cal[monthIdx];
  const water = plant.species?.water ?? 'Medium';
  const key = (water === 'High' || water === 'Frequent') ? 'High'
    : (water === 'Low' || water === 'Minimum') ? 'Low' : 'Medium';
  return GENERIC_CALENDAR[key][monthIdx];
}

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

function formatEventTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const d = new Date(ts);
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
}

export default function PlantDetailModal({ open, plant: plantProp, onClose, onLearn, onCheckup, onOpenSubscription }) {
  const { plants, getWaterLevel, getHappyLevel, waterPlant, removePlant, weather, settings, photos, setPlantPhoto, removePlantPhoto, addPlantEvent, getPlantEvents, setPlantReminder, getPlantReminder, updatePlant } = usePlants();

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

  // Event log
  const plantEvents = isPro ? getPlantEvents(plant.id) : [];
  const reminderTime = isPro ? getPlantReminder(plant.id) : null;
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [calOpen, setCalOpen]   = useState(false);
  const [descOpen, setDescOpen]  = useState(false);
  const [descEdit, setDescEdit]  = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const currentMonth = new Date().getMonth();

  // Drag-scroll ref for month list
  const monthsRef  = useRef(null);
  const monthsDrag = useRef({ active: false, startX: 0, scrollX: 0 });

  function onMonthsDragStart(e) {
    const el = monthsRef.current; if (!el) return;
    monthsDrag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollX: el.scrollLeft };
    el.style.cursor = 'grabbing'; el.style.userSelect = 'none';
  }
  function onMonthsDragMove(e) {
    if (!monthsDrag.current.active) return;
    const el = monthsRef.current; if (!el) return;
    el.scrollLeft = monthsDrag.current.scrollX - (e.pageX - el.offsetLeft - monthsDrag.current.startX);
  }
  function onMonthsDragEnd() {
    monthsDrag.current.active = false;
    if (monthsRef.current) { monthsRef.current.style.cursor = 'grab'; monthsRef.current.style.userSelect = ''; }
  }

  // Water burst particles
  const [bursting, setBursting] = useState(false);
  const BURST_PARTICLES = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 2 * Math.PI + (Math.random() * 0.6);
    const dist  = 36 + Math.random() * 44;
    return {
      tx: Math.round(Math.cos(angle) * dist),
      ty: Math.round(Math.sin(angle) * dist),
      delay: Math.round(Math.random() * 80),
      emoji: i % 2 === 0 ? '\uD83D\uDCA7' : '\uD83C\uDF3F',
    };
  });

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
    setBursting(true);
    setTimeout(() => setBursting(false), 720);
  }

  function handleDelete() {
    if (window.confirm(`Remove ${plant.nickname}?`)) {
      removePlant(plant.id);
      onClose();
    }
  }

  const nextLabel   = formatNextWatering(plant);
  const isOverdue   = nextLabel === 'overdue';

  // Fetch Perenual details for API-sourced plants AND local species that have a perenualId
  const isApiPlant = hasApiKey && (
    (typeof plant.species.id === 'string' && plant.species.id.startsWith('api-')) ||
    !!plant.species.perenualId
  );
  const [apiDetails, setApiDetails] = useState(null);
  const [apiLoading, setApiLoading] = useState(isApiPlant);

  useEffect(() => {
    if (!isApiPlant) return;
    const numericId = plant.species.perenualId ||
      (typeof plant.species.id === 'string' ? parseInt(plant.species.id.replace('api-', ''), 10) : null);
    if (!numericId) { setApiLoading(false); return; }
    let cancelled = false;
    getSpeciesDetails(numericId).then(data => {
      if (!cancelled) {
        setApiDetails(data ?? null);
        setApiLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [plant.species.id, plant.species.perenualId, isApiPlant]);

  // Reset expanded sections when modal closes (prevents state leakage across plants)
  useEffect(() => {
    if (!open) {
      setDescOpen(false);
      setDescEdit(false);
      setDescDraft('');
      setLogOpen(false);
      setCalOpen(false);
      setShowNoteInput(false);
      setNoteInput('');
    }
  }, [open]);

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
          <div className="plant-detail__water-wrap plant-detail__viewer-water">
            <button className="plant-detail__water-overlay-btn" onClick={handleWater} aria-label="Water plant">
              💧
            </button>
            {bursting && (
              <div className="water-burst" aria-hidden="true">
                {BURST_PARTICLES.map((p, i) => (
                  <span
                    key={i}
                    className="burst-particle"
                    style={{ '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, animationDelay: `${p.delay}ms` }}
                  >{p.emoji}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Identity — photo avatar floated right for Pro users */}
        <div className="plant-detail__identity">
          <div className="plant-detail__identity-text">
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
          {isPro ? (
            <button className="plant-detail__photo-avatar" onClick={() => photoRef.current?.click()} aria-label="Plant photo">
              {plantPhoto
                ? <img className="plant-detail__avatar-img" src={plantPhoto.dataUrl} alt={plant.nickname} />
                : <span className="plant-detail__avatar-placeholder">📷</span>
              }
              {plantPhoto && (
                <span
                  className="plant-detail__avatar-remove"
                  role="button"
                  aria-label="Remove photo"
                  onClick={e => { e.stopPropagation(); removePlantPhoto(plant.id); }}
                >×</span>
              )}
            </button>
          ) : (
            <button
              className="plant-detail__photo-avatar plant-detail__photo-avatar--locked"
              onClick={onOpenSubscription}
              aria-label="Photo journal — upgrade to Pro"
              title="Unlock with Pro"
            >
              <span className="plant-detail__avatar-placeholder">📷</span>
              <span className="plant-detail__avatar-lock">🔒</span>
            </button>
          )}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handlePhotoSelect}
        />

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

          {/* Water note + bio section — always shown so any plant can have a custom note */}
          <>
            <div className="plant-detail__divider" />
            <div className="plant-detail__desc-row">
              {plant.species.water && (
                <p className="plant-detail__water-note">{plant.species.water}</p>
              )}
              {isApiPlant && apiLoading ? (
                <span className="skeleton skeleton-line plant-detail__desc-skel" style={{ width: 72, height: 28, borderRadius: 8 }} />
              ) : (
                <button
                  className={`plant-detail__desc-btn${descOpen ? ' plant-detail__desc-btn--open' : ''}`}
                  onClick={() => setDescOpen(o => !o)}
                  aria-expanded={descOpen}
                  aria-label="About this species"
                >
                  📖 <span className="plant-detail__desc-btn-label">About</span>
                </button>
              )}
            </div>
            {descOpen && (
              <div className="plant-detail__desc-body">
                {descEdit ? (
                  <div className="plant-detail__desc-edit">
                    <textarea
                      className="plant-detail__desc-textarea"
                      value={descDraft}
                      onChange={e => setDescDraft(e.target.value)}
                      rows={4}
                      placeholder="Enter species description\u2026"
                    />
                    <div className="plant-detail__desc-edit-actions">
                      <button className="plant-detail__desc-save" onClick={() => {
                        const val = descDraft.trim();
                        updatePlant(plant.id, p => ({ ...p, species: { ...p.species, customDescription: val || undefined } }));
                        setDescEdit(false);
                      }}>Save</button>
                      <button className="plant-detail__desc-cancel" onClick={() => { setDescEdit(false); setDescDraft(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="plant-detail__desc-view">
                    <p className="plant-detail__desc-text">{plant.species?.customDescription || apiDetails?.description || ''}</p>
                    <button
                      className="plant-detail__desc-edit-btn"
                      onClick={() => { setDescDraft(plant.species?.customDescription || apiDetails?.description || ''); setDescEdit(true); }}
                      aria-label="Edit description"
                    >✏️</button>
                  </div>
                )}
              </div>
            )}
          </>
        </div>

        {/* Seasonal care calendar — Pro-gated */}
        <div className="plant-detail__section plant-detail__cal-section">
          {isPro ? (
            <>
              <div className="plant-detail__events-header">
                <button
                  className={`plant-detail__events-toggle${calOpen ? ' plant-detail__events-toggle--open' : ''}`}
                  onClick={() => setCalOpen(o => !o)}
                >
                  <span className="plant-detail__events-title">📅 Seasonal Care</span>
                  <span className="plant-detail__events-chevron">›</span>
                </button>
              </div>
              <div className={`plant-detail__cal-body${calOpen ? ' plant-detail__cal-body--open' : ''}`}>
                  <div
                    className="plant-detail__months"
                    ref={monthsRef}
                    onMouseDown={onMonthsDragStart}
                    onMouseMove={onMonthsDragMove}
                    onMouseUp={onMonthsDragEnd}
                    onMouseLeave={onMonthsDragEnd}
                  >
                  {MONTHS.map((m, i) => (
                    <button
                      key={i}
                      className={`plant-detail__month-chip${calMonth === i ? ' plant-detail__month-chip--active' : ''}${currentMonth === i && calMonth !== i ? ' plant-detail__month-chip--current' : ''}`}
                      onClick={() => setCalMonth(i)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="plant-detail__cal-tip">{getCalendarTip(plant, calMonth)}</p>
              </div>
            </>
          ) : (
            <div className="plant-detail__photo-locked">
              <span className="plant-detail__photo-icon">📅</span>
              <span className="plant-detail__photo-locked-label">Seasonal Care</span>
              <LockBadge onUnlock={onOpenSubscription} />
            </div>
          )}
        </div>

        {/* Event log — Pro-gated */}
        <div className="plant-detail__section plant-detail__events-section">
          {isPro ? (
            <>
              <div className="plant-detail__events-header">
                <button
                  className={`plant-detail__events-toggle${logOpen ? ' plant-detail__events-toggle--open' : ''}`}
                  onClick={() => setLogOpen(o => !o)}
                >
                  <span className="plant-detail__events-title">📋 Plant Log</span>
                  <span className="plant-detail__events-chevron">›</span>
                </button>
                <div className="plant-detail__events-actions">
                  <button className="plant-detail__event-btn" onClick={() => addPlantEvent(plant.id, 'repotted')}>🪴 Repotted</button>
                  <button className="plant-detail__event-btn" onClick={() => addPlantEvent(plant.id, 'fertilized')}>🌿 Fertilized</button>
                  <button className="plant-detail__event-btn" onClick={() => setShowNoteInput(s => !s)}>📝 Note</button>
                </div>
              </div>
              <div className={`plant-detail__events-body${logOpen ? ' plant-detail__events-body--open' : ''}`}>
                {showNoteInput && (
                  <div className="plant-detail__note-row">
                    <input
                      className="plant-detail__note-input"
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Add a note…"
                      maxLength={120}
                    />
                    <button className="btn btn--primary plant-detail__note-save" onClick={() => {
                      if (noteInput.trim()) {
                        addPlantEvent(plant.id, 'noted', noteInput.trim());
                        setNoteInput('');
                        setShowNoteInput(false);
                      }
                    }}>Save</button>
                  </div>
                )}
                {plantEvents.length > 0 ? (
                  <ul className="plant-detail__events-timeline">
                    {plantEvents.slice(0, 10).map((ev, i) => (
                      <li key={i} className="plant-detail__event">
                        <span className="plant-detail__event-icon">{ev.type === 'watered' ? '💧' : ev.type === 'repotted' ? '🪴' : ev.type === 'fertilized' ? '🌿' : '📝'}</span>
                        <div className="plant-detail__event-body">
                          <span className="plant-detail__event-label">{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
                          {ev.note && <span className="plant-detail__event-note">{ev.note}</span>}
                        </div>
                        <span className="plant-detail__event-time">{formatEventTime(ev.timestamp)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="plant-detail__events-empty">No events yet. Start by watering!</p>
                )}
              </div>
            </>
          ) : (
            <div className="plant-detail__photo-locked">
              <span className="plant-detail__photo-icon">📋</span>
              <span className="plant-detail__photo-locked-label">Log</span>
              <LockBadge onUnlock={onOpenSubscription} />
            </div>
          )}
        </div>

        {/* Reminder scheduling — Pro-gated */}
        <div className="plant-detail__section plant-detail__reminder-section">
          {isPro ? (
            <div className="plant-detail__reminder-row">
              <div>
                <p className="plant-detail__reminder-label">⏰ Daily Reminder</p>
                <p className="plant-detail__reminder-sub">{reminderTime ? `Scheduled at ${reminderTime}` : 'No reminder set'}</p>
              </div>
              <input
                type="time"
                className="plant-detail__reminder-input"
                value={reminderTime ?? ''}
                onChange={e => setPlantReminder(plant.id, e.target.value || null)}
                aria-label="Watering reminder time"
              />
            </div>
          ) : (
            <div className="plant-detail__photo-locked">
              <span className="plant-detail__photo-icon">⏰</span>
              <span className="plant-detail__photo-locked-label">Daily Reminder</span>
              <LockBadge onUnlock={onOpenSubscription} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="plant-detail__actions">
          {onCheckup && (
            isPro ? (
              <button className="btn plant-detail__checkup-btn" onClick={() => { onCheckup(plant); onClose(); }}>
                🩺 Checkup
              </button>
            ) : (
              <button className="btn plant-detail__checkup-btn plant-detail__checkup-btn--locked" onClick={onOpenSubscription}>
                🩺 Checkup 🔒
              </button>
            )
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
