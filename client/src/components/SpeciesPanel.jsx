import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';
import PlantViewer from './PlantViewer';
import LockBadge from './LockBadge';

const API_KEY = process.env.REACT_APP_PERENUAL_KEY;

export default function SpeciesPanel({ open, species: speciesProp, onClose, onUpgrade }) {
  const savedSpecies = useRef(speciesProp);
  if (speciesProp) savedSpecies.current = speciesProp;
  const species = savedSpecies.current;
  const { settings } = usePlants();
  const isPro = settings?.isPro;
  const [perenual, setPerenual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isPro || !species?.perenualId || !API_KEY) return;
    setLoading(true);
    fetch(`https://perenual.com/api/species/details/${species.perenualId}?key=${API_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPerenual(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isPro, species?.perenualId]);

  if (!species) return null;

  const imgUrl = perenual?.default_image?.medium_url ?? null;
  const description = perenual?.description ?? null;

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal species-panel">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        {/* Hero — model always visible */}
        <div className="species-panel__hero">
          {isPro && imgUrl ? (
            <img className="species-panel__img" src={imgUrl} alt={species.name} loading="lazy" />
          ) : (
            <div className="species-panel__model">
              <PlantViewer modelUrl={species.model} height={160} />
            </div>
          )}
        </div>

        <div className="species-panel__body">
          <p className="species-panel__latin">{species.latin}</p>
          <h2 className="species-panel__name">{species.name}</h2>

          {/* Care tiles */}
          <div className="species-panel__tiles">
            <div className="species-panel__tile"><span>💧</span>{species.water}</div>
            <div className="species-panel__tile"><span>☀️</span>{species.light}</div>
            <div className="species-panel__tile"><span>🌡</span>{species.temp}</div>
            {species.toxic && <div className="species-panel__tile species-panel__tile--toxic"><span>⚠️</span>Toxic</div>}
          </div>

          {/* Pro-gated description */}
          {isPro ? (
            loading ? (
              <p className="species-panel__loading">Loading details…</p>
            ) : description ? (
              <div className="species-panel__desc-wrap">
                <p className={`species-panel__desc${expanded ? ' species-panel__desc--expanded' : ''}`}>
                  {description}
                </p>
                {description.length > 220 && (
                  <button className="species-panel__expand" onClick={() => setExpanded(e => !e)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
                {perenual?.scientific_name?.[0] && (
                  <a
                    className="species-panel__link"
                    href={`https://perenual.com/plants/${species.perenualId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Full profile →
                  </a>
                )}
              </div>
            ) : null
          ) : (
            <div className="species-panel__lock-wrap">
              <p className="species-panel__lock-msg">Unlock the full plant encyclopedia with Pro.</p>
              <LockBadge onUnlock={onUpgrade} />
            </div>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
