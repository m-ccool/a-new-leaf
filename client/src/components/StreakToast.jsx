import { useEffect } from 'react';

const MILESTONE_COLORS = {
  3:  'var(--green-mid)',
  7:  'var(--green)',
  14: 'var(--blue)',
  30: 'var(--amber)',
};

export default function StreakToast({ milestone, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const color = MILESTONE_COLORS[milestone.days] ?? 'var(--accent)';

  return (
    <div className="streak-toast" role="status" aria-live="polite" onClick={onDismiss}>
      <div className="streak-toast__inner">
        <span className="streak-toast__emoji" style={{ '--streak-color': color }}>
          {milestone.emoji}
        </span>
        <div className="streak-toast__text">
          <p className="streak-toast__days">🔥 {milestone.days}-Day Streak</p>
          <p className="streak-toast__msg">{milestone.message}</p>
        </div>
        <button
          className="streak-toast__close"
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          aria-label="Dismiss"
        >×</button>
      </div>
    </div>
  );
}
