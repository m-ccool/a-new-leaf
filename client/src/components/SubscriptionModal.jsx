import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';

const FREE_FEATURES = [
  '3D plant gallery (all models)',
  'Water & happiness tracking',
  'Live weather + GPS integration',
  'Time-of-day sky themes',
  'Daily plant tip',
  'Watering streak + garden grade',
  'Accent color picker',
  'Offline mode (PWA)',
];

const PRO_FEATURES = [
  'Everything in Free',
  '📖 Plant encyclopedia (10k+ species)',
  '🔬 Disease & pest identification',
  '📷 Photo journal per plant',
  '📅 Seasonal care calendar',
  '📋 Plant health event log',
  '📊 Advanced stats & streak graph',
  '🎨 Custom accent colors + hex picker',
  '☁️ iCloud / Google Drive backup',
  '⏰ Per-plant reminder scheduling',
];

export default function SubscriptionModal({ open, onClose }) {
  const { settings, setSettings } = usePlants();

  function unlockPro() {
    setSettings(prev => ({ ...prev, isPro: true }));
    onClose();
  }

  if (settings?.isPro) {
    return (
      <Dialog open={open} onClose={onClose} transition className="modal-overlay">
        <DialogPanel className="modal sub-modal">
          <div className="sheet-handle" aria-hidden="true" />
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="sub-modal__pro-state">
            <p className="sub-modal__pro-badge">✦ Pro Member</p>
            <p className="sub-modal__pro-msg">You have full access to all A New Leaf features.</p>
          </div>
          <ul className="sub-modal__list sub-modal__list--pro">
            {PRO_FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <button className="btn btn--ghost" style={{ width: '100%', marginTop: '.75rem' }} onClick={onClose}>
            Done
          </button>
        </DialogPanel>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal sub-modal">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div className="sub-modal__header">
          <p className="sub-modal__leaf">🌿</p>
          <h2 className="sub-modal__title">A New Leaf Pro</h2>
          <p className="sub-modal__price">$1.99 &nbsp;·&nbsp; one time, forever</p>
        </div>

        <div className="sub-modal__compare">
          <div className="sub-modal__tier">
            <p className="sub-modal__tier-label">Free</p>
            <ul className="sub-modal__list">
              {FREE_FEATURES.map(f => <li key={f}><span>✓</span>{f}</li>)}
            </ul>
          </div>
          <div className="sub-modal__tier sub-modal__tier--pro">
            <p className="sub-modal__tier-label">Pro</p>
            <ul className="sub-modal__list sub-modal__list--pro">
              {PRO_FEATURES.map(f => <li key={f}><span>✦</span>{f}</li>)}
            </ul>
          </div>
        </div>

        <button className="btn btn--primary sub-modal__cta" onClick={unlockPro}>
          Unlock Pro
        </button>
        <p className="sub-modal__note">Unlock once. Every future Pro feature included.</p>
      </DialogPanel>
    </Dialog>
  );
}
