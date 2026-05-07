import { wmoInfo } from '../hooks/useWeather';

export default function WeatherWidget({ weather, loading, onClick }) {
  if (loading) {
    return (
      <button className="weather-chip weather-chip--loading" onClick={onClick} aria-label="Weather loading">
        … °
      </button>
    );
  }
  if (!weather) return null;

  const { emoji } = wmoInfo(weather.code);
  return (
    <button className="weather-chip" onClick={onClick} aria-label="View weather details">
      {emoji} {weather.temp}°
    </button>
  );
}
