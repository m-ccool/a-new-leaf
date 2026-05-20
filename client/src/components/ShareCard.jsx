import { Suspense, useEffect, useRef } from 'react';
import { usePlants } from '../context/PlantContext';
import LockBadge from './LockBadge';
import PlantViewer from './PlantViewer';
import { MODELS } from '../hooks/usePlantAPI';

const GRADE_COLORS = {
  A: '#3d9c68', B: '#52b788', C: '#f59e0b', D: '#fb923c', F: '#ef4444',
};

function drawShareCard(canvas, { gardenName, grade, streak, plants }) {
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;
  canvas.width  = W;
  canvas.height = H;

  // Background gradient
  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 80, W / 2, H / 2, W * 0.8);
  bg.addColorStop(0, '#1a2e22');
  bg.addColorStop(1, '#0d1511');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

  // Grade ring
  const cx = W / 2, cy = H / 2 - 60;
  const r  = 160;
  const gradeCol = GRADE_COLORS[grade] ?? '#52b788';

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 24;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 2 * 0.85 - Math.PI / 2);
  ctx.strokeStyle = gradeCol;
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Grade letter
  ctx.fillStyle = gradeCol;
  ctx.font = 'bold 200px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(grade ?? '?', cx, cy);

  // Garden name
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(gardenName || 'My Garden', W / 2, cy + r + 70);

  // Streak pill
  const pillY = cy + r + 140;
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 130, pillY - 28, 260, 56, 28);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '34px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`🔥 ${streak}-day streak  ·  ${plants.length} plant${plants.length !== 1 ? 's' : ''}`, W / 2, pillY);

  // Top plant nicknames
  const names = plants.slice(0, 4).map(p => p.nickname);
  if (names.length > 0) {
    const chipY = cy + r + 230;
    ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText(names.join('  ·  '), W / 2, chipY);
  }

  // ANL wordmark
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 A New Leaf', W / 2, H - 60);
}

export default function ShareCard({ open, onOpenSubscription }) {
  const { plants, user, getGardenGrade, settings } = usePlants();
  const isPro  = settings?.isPro ?? false;
  const grade  = getGardenGrade();
  const streak = user?.streak ?? 0;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!open || !isPro || !canvasRef.current) return;
    drawShareCard(canvasRef.current, {
      gardenName: user?.gardenName ?? 'My Garden',
      grade,
      streak,
      plants,
    });
  }, [open, isPro, grade, streak, plants, user]);

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async blob => {
      const file = new File([blob], 'my-garden.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'My Garden — A New Leaf' }); return; }
        catch {}
      }
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url; a.download = 'my-garden.png'; a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  if (!isPro) {
    const lockedModel = MODELS[user?.avatarModelIdx ?? 0];
    return (
      <div className="share-card-locked" onClick={onOpenSubscription}>
        <div className="share-card-locked__preview" aria-hidden="true">
          <Suspense fallback={null}>
            <PlantViewer modelUrl={lockedModel} height={140} compact />
          </Suspense>
          <div className="share-card-locked__grade" style={{ color: GRADE_COLORS[grade] ?? 'var(--green)' }}>
            {grade ?? 'A'}
          </div>
        </div>
        <LockBadge onUnlock={onOpenSubscription} />
      </div>
    );
  }

  const proModel = MODELS[user?.avatarModelIdx ?? 0];
  return (
    <div className="share-card">
      {/* Hidden canvas - used only for share image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
      {/* Glass preview with live 3D model + grade overlay */}
      <div className="share-card__preview">
        <Suspense fallback={null}>
          <PlantViewer modelUrl={proModel} height={160} compact />
        </Suspense>
        <div
          className="share-card__grade-overlay"
          style={{ color: GRADE_COLORS[grade] ?? 'var(--green)' }}
        >
          {grade ?? '?'}
        </div>
      </div>
      <button className="btn btn--primary share-card__btn" onClick={handleShare}>
        🎴 Share Garden
      </button>
    </div>
  );
}
