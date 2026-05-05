export default function PlantCardSkeleton() {
  return (
    <div className="plant-card plant-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton-model" />
      <div className="plant-card__info">
        <div className="skeleton skeleton-line skeleton-line--xshort" style={{ marginBottom: '.45rem' }} />
        <div className="skeleton skeleton-line" style={{ marginBottom: '.3rem' }} />
        <div className="skeleton skeleton-line skeleton-line--short" style={{ marginBottom: '.75rem' }} />
        <div className="plant-card__bars">
          <div className="skeleton skeleton-bar-icon" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-bar-icon" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
    </div>
  );
}
