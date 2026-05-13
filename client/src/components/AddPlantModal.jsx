import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { SPECIES } from '../data/species';
import PlantViewer from './PlantViewer';
import { searchSpecies, mapApiToSpecies, modelForId, hasApiKey, MODELS } from '../hooks/usePlantAPI';

export default function AddPlantModal({ open, onAdd, onClose }) {
  const [nickname, setNickname] = useState('');
  const [modelIdx, setModelIdx] = useState(0);

  // Local fallback state
  const [localSpeciesId, setLocalSpeciesId] = useState(SPECIES[0].id);

  // API search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedApiSpecies, setSelectedApiSpecies] = useState(null);

  const [speciesOpen, setSpeciesOpen] = useState(false);
  const speciesDropdownRef = useRef(null);

  // Close species dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (speciesDropdownRef.current && !speciesDropdownRef.current.contains(e.target)) {
        setSpeciesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const debounceRef = useRef(null);

  // Debounced API search
  useEffect(() => {
    if (!hasApiKey) return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchSpecies(query);
      setResults(data);
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // When API result selected via Combobox, auto-assign model
  function selectApiResult(plant) {
    if (!plant) return;
    const mapped = mapApiToSpecies(plant, modelForId(plant.id));
    setSelectedApiSpecies(mapped);
    setModelIdx(MODELS.indexOf(mapped.model) !== -1 ? MODELS.indexOf(mapped.model) : 0);
    setResults([]);
    setQuery(plant.common_name || plant.scientific_name?.[0] || '');
  }

  // Derived current species for preview
  const currentSpecies = selectedApiSpecies
    ? { ...selectedApiSpecies, model: MODELS[modelIdx] }
    : { ...SPECIES.find(s => s.id === Number(localSpeciesId)), model: MODELS[modelIdx] };

  function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim()) return;
    onAdd({
      nickname: nickname.trim(),
      species: { ...currentSpecies, model: MODELS[modelIdx] },
    });
  }

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <h2 className="modal__title">Add a Plant</h2>

        <div className="modal__preview">
          <PlantViewer modelUrl={MODELS[modelIdx]} height={180} />
        </div>

        {/* Model picker */}
        <div className="model-picker">
          <button
            type="button"
            className="model-picker__btn"
            onClick={() => setModelIdx(i => (i - 1 + MODELS.length) % MODELS.length)}
          >‹</button>
          <span className="model-picker__label">Skin {modelIdx + 1} of {MODELS.length}</span>
          <button
            type="button"
            className="model-picker__btn"
            onClick={() => setModelIdx(i => (i + 1) % MODELS.length)}
          >›</button>
        </div>

        <form onSubmit={handleSubmit} className="modal__form" style={{ marginTop: '1rem' }}>
          <label className="modal__label">
            Nickname
            <input
              className="modal__input"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="e.g. Hercules"
              maxLength={30}
              autoFocus
            />
          </label>

          {/* API search (Headless UI Combobox) or local fallback */}
          {hasApiKey ? (
            <label className="modal__label">
              Search Species
              <Combobox value={selectedApiSpecies} onChange={selectApiResult} nullable>
                <ComboboxInput
                  className="modal__input"
                  displayValue={(item) => item ? (item.name || query) : query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. jade plant, monstera…"
                />
                {searching && <span className="species-search-hint">Searching…</span>}
                {results.length > 0 && (
                  <ComboboxOptions as="div" className="species-results" static>
                    {results.map(r => (
                      <ComboboxOption
                        key={r.id}
                        value={r}
                        className={({ focus, selected }) =>
                          `species-result${selected ? ' species-result--selected' : ''}${focus ? ' species-result--active' : ''}`
                        }
                      >
                        <p className="species-result__name">{r.common_name || r.scientific_name?.[0]}</p>
                        <p className="species-result__latin">{r.scientific_name?.[0]}</p>
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                )}
              </Combobox>
            </label>
          ) : (
            <label className="modal__label">
              Species
              <div className="species-dropdown" ref={speciesDropdownRef}>
                <button
                  type="button"
                  className="species-dropdown__trigger modal__input"
                  onClick={() => setSpeciesOpen(o => !o)}
                >
                  <span>
                    {SPECIES.find(s => s.id === Number(localSpeciesId))?.name}
                    {' — '}
                    <em style={{ fontStyle: 'italic', opacity: .75 }}>
                      {SPECIES.find(s => s.id === Number(localSpeciesId))?.latin}
                    </em>
                  </span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, opacity: .65, transform: speciesOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
                    <path d="M1 1l4 4 4-4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {speciesOpen && (
                  <div className="species-dropdown__list">
                    {SPECIES.map(s => (
                      <div
                        key={s.id}
                        className={`species-dropdown__item${Number(localSpeciesId) === s.id ? ' species-dropdown__item--active' : ''}`}
                        onClick={() => { setLocalSpeciesId(s.id); setSpeciesOpen(false); setSelectedApiSpecies(null); }}
                      >
                        <span className="species-dropdown__name">{s.name}</span>
                        <span className="species-dropdown__latin">{s.latin}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="species-search-hint">
                Add REACT_APP_PERENUAL_KEY to client/.env.local for live species search
              </span>
            </label>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={!nickname.trim()}>
              Add to Garden
            </button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}

