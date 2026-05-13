import { useRef } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { wmoInfo } from '../hooks/useWeather';

function fmtHour(h) {
  if (h === new Date().getHours()) return 'Now';
  const suffix = h >= 12 ? 'pm' : 'am';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}${suffix}`;
}

export default function WeatherModal({ open, weather: weatherProp, onClose }) {
  const savedWeather = useRef(weatherProp);
  if (weatherProp) savedWeather.current = weatherProp;
  const weather = savedWeather.current;
  if (!weather && !open) return null;

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
    <Dialog open={open} onClose={onClose} transition className="modal-overlay">
      <DialogPanel className="modal modal--center">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
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
      </DialogPanel>
    </Dialog>
  );
}
