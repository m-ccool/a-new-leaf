import { useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import PlantViewer from './PlantViewer';

export default function DailyTipModal({ open, tip: tipProp, modelUrl, plantName, onClose }) {
  const savedTip = useRef(tipProp);
  if (tipProp) savedTip.current = tipProp;
  const tip = savedTip.current;
  if (!tip) return null;

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal daily-tip-modal">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

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
      </DialogPanel>
    </Dialog>
  );
}
