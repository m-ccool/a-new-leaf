import PlantViewer from './PlantViewer';

export default function DailyTipModal({ tip, modelUrl, plantName, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal daily-tip-modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        {modelUrl && (
          <div className="daily-tip__viewer">
            <PlantViewer modelUrl={modelUrl} height={160} />
          </div>
        )}

        <div className="daily-tip__body">
          <p className="daily-tip__emoji">{tip.emoji}</p>
          {plantName && <p className="daily-tip__plant-name">{plantName}</p>}
          <p className="daily-tip__label">Today's Plant Fact</p>
          <p className="daily-tip__text">{tip.tip}</p>
        </div>

        <div className="daily-tip__actions">
          <button className="btn btn--primary daily-tip__dismiss" onClick={onClose}>
            Got it 🌿
          </button>
        </div>
      </div>
    </div>
  );
}
