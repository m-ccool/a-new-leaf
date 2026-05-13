import { wmoInfo } from '../hooks/useWeather';

export default function WeatherWidget({ weather, loading, error, onRetry, onClick }) {
  if (loading) {
    return (
      <button className="weather-chip weather-chip--loading" onClick={onClick} aria-label="Weather loading">
        📍 …°
      </button>
    );
  }

  if (!weather) {
    return (
      <button
        className="weather-chip weather-chip--locate"
        onClick={onRetry}
        aria-label="Enable location for weather"
        title={error === 'denied' ? 'Location was denied — tap to try again' : 'Tap to get local weather'}
      >
        <span className="weather-chip__pin">📍</span>
        <span>Weather</span>
      </button>
    );
  }

  const { emoji } = wmoInfo(weather.code);
  return (
    <button className="weather-chip" onClick={onClick} aria-label="View weather details">
      {emoji} {weather.temp}°
    </button>
  );
}
