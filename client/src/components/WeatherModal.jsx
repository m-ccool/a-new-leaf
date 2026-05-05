import { wmoInfo } from '../hooks/useWeather';

function fmtHour(h) {
  if (h === new Date().getHours()) return 'Now';
  const suffix = h >= 12 ? 'pm' : 'am';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}${suffix}`;
}

export default function WeatherModal({ weather, onClose }) {
  if (!weather) return null;

  const { emoji, label } = wmoInfo(weather.code);
  const currentHour = new Date().getHours();

  const hourlyForecast = weather.hourly
    ? weather.hourly.time
        .map((t, i) => ({
          h:    new Date(t).getHours(),
          temp: Math.round(weather.hourly.temperature_2m[i]),
          code: weather.hourly.weather_code[i],
        }))
        .filter(({ h }) => h >= currentHour)
        .slice(0, 7)
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--center" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal__title">Local Weather</h2>

        <div className="weather-current">
          <div className="weather-current__icon">{emoji}</div>
          <div className="weather-current__temp">{weather.temp}°F</div>
          <div className="weather-current__label">{label}</div>
          <div className="weather-current__sub">
            Feels like {weather.feelsLike}°F &nbsp;·&nbsp; Humidity {weather.humidity}%
          </div>
        </div>

        {hourlyForecast.length > 0 && (
          <div className="weather-hourly">
            {hourlyForecast.map(({ h, temp, code }, i) => {
              const { emoji: hEmoji } = wmoInfo(code);
              return (
                <div key={i} className="weather-hour">
                  <span className="weather-hour__time">{fmtHour(h)}</span>
                  <span className="weather-hour__icon">{hEmoji}</span>
                  <span className="weather-hour__temp">{temp}°</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="weather-footer">
          📍 {weather.lat}°, {weather.lon}° &nbsp;·&nbsp; {weather.timezone}
        </div>
      </div>
    </div>
  );
}
