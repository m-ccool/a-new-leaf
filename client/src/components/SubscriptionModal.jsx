import { Dialog, DialogPanel } from '@headlessui/react';
import { usePlants } from '../context/PlantContext';

const FREE_FEATURES = [
  '3D plant gallery',
  'Water & happiness tracking',
  'Live weather integration',
  'Daily plant tip',
  'Watering streak & garden grade',
  'Theme customization',
];

const PRO_FEATURES = [
  'Everything in Free',
  '📖 Plant encyclopedia (Perenual)',
  '🔬 AI disease & pest identification',
  '🌿 Extended species database',
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
          <p className="sub-modal__price">$1.99 / mo &nbsp;·&nbsp; $9.99 / yr</p>
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
        <p className="sub-modal__note">No payment required during preview · cancel anytime</p>
      </DialogPanel>
    </Dialog>
  );
}
