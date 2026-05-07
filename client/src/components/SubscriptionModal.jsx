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

export default function SubscriptionModal({ onClose }) {
  const { settings, setSettings } = usePlants();

  function unlockPro() {
    setSettings(prev => ({ ...prev, isPro: true }));
    onClose();
  }

  if (settings?.isPro) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal sub-modal" onClick={e => e.stopPropagation()}>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
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
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal sub-modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

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
      </div>
    </div>
  );
}
