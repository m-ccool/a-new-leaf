// LockBadge — inline "🔒 Pro" chip for gated features
// onUnlock: callback to open SubscriptionModal from parent
export default function LockBadge({ onUnlock }) {
  return (
    <button
      className="lock-badge"
      onClick={e => { e.stopPropagation(); onUnlock?.(); }}
      aria-label="Upgrade to Pro to unlock"
    >
      🔒 Pro
    </button>
  );
}
