import { useState, useEffect, useRef } from 'react';
import { getDiseases, hasApiKey } from '../hooks/usePlantAPI';

export default function DiseasePanel({ onClose }) {
  const [diseases, setDiseases]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [diagImage, setDiagImage]   = useState(null);
  const fileInputRef                = useRef(null);

  useEffect(() => {
    if (!hasApiKey) { setLoading(false); return; }
    getDiseases().then(data => {
      setDiseases(data ?? []);
      setLoading(false);
    });
  }, []);

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (file) setDiagImage(URL.createObjectURL(file));
  }

  // Empty query → show all; 1 char → prompt; 2+ → filter
  const filtered = query.trim().length === 0
    ? diseases
    : query.trim().length < 2
    ? []
    : diseases.filter(d =>
        d.common_name?.toLowerCase().includes(query.toLowerCase()) ||
        d.description?.[0]?.description?.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="modal-overlay disease-overlay" onClick={onClose}>
      <div className="modal disease-panel" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="disease-panel__title">� Plant Checkup</h2>

        {/* Camera-first diagnose — opens native camera on mobile, file picker on desktop */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
          aria-label="Select plant image for diagnosis"
        />
        <button
          className="disease-panel__diagnose-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="AI image diagnosis – coming soon"
        >
          📷 Diagnose
          <span className="disease-panel__diagnose-badge">AI Soon</span>
        </button>

        {diagImage && (
          <div className="disease-panel__diag-preview">
            <img src={diagImage} alt="Uploaded plant" className="disease-panel__diag-img" />
            <p className="disease-panel__diag-note">AI analysis coming soon — search below for now.</p>
          </div>
        )}

        <p className="disease-panel__section-label">Or search symptoms &amp; diseases</p>

        <input
          className="disease-panel__search"
          placeholder="Search diseases…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <div className="disease-panel__list">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="disease-card disease-card--skeleton">
                <div className="skeleton skeleton-line disease-card__sk-name" />
                <div className="skeleton skeleton-line disease-card__sk-line" />
                <div className="skeleton skeleton-line disease-card__sk-line disease-card__sk-line--short" />
              </div>
            ))
          ) : !hasApiKey ? (
            <p className="disease-panel__empty">API key not configured.</p>
          ) : query.trim().length === 1 ? (
            <p className="disease-panel__empty">Type 1 more character to search…</p>
          ) : filtered.length === 0 ? (
            <p className="disease-panel__empty">No results for &ldquo;{query}&rdquo;.</p>
          ) : (
            filtered.map(d => (
              <div key={d.id} className="disease-card">
                <h4 className="disease-card__name">{d.common_name}</h4>
                {d.description?.[0]?.description && (
                  <p className="disease-card__desc">
                    {d.description[0].description.length > 160
                      ? d.description[0].description.slice(0, 160) + '…'
                      : d.description[0].description}
                  </p>
                )}
                {d.solution?.[0]?.description && (
                  <p className="disease-card__solution">
                    💊{' '}
                    {d.solution[0].description.length > 130
                      ? d.solution[0].description.slice(0, 130) + '…'
                      : d.solution[0].description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
