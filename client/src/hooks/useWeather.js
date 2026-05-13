import { useState, useEffect } from 'react';

// WMO weather interpretation codes → emoji + label
const WMO = {
  0:  { label: 'Clear sky',          emoji: '☀️' },
  1:  { label: 'Mainly clear',       emoji: '🌤' },
  2:  { label: 'Partly cloudy',      emoji: '⛅' },
  3:  { label: 'Overcast',           emoji: '☁️' },
  45: { label: 'Foggy',              emoji: '🌫' },
  48: { label: 'Icy fog',            emoji: '🌫' },
  51: { label: 'Light drizzle',      emoji: '🌦' },
  53: { label: 'Drizzle',            emoji: '🌦' },
  55: { label: 'Heavy drizzle',      emoji: '🌧' },
  61: { label: 'Slight rain',        emoji: '🌧' },
  63: { label: 'Rain',               emoji: '🌧' },
  65: { label: 'Heavy rain',         emoji: '🌧' },
  71: { label: 'Slight snow',        emoji: '🌨' },
  73: { label: 'Snow',               emoji: '❄️' },
  75: { label: 'Heavy snow',         emoji: '❄️' },
  80: { label: 'Rain showers',       emoji: '🌦' },
  81: { label: 'Showers',            emoji: '🌧' },
  82: { label: 'Violent showers',    emoji: '⛈' },
  95: { label: 'Thunderstorm',       emoji: '⛈' },
  96: { label: 'Thunderstorm',       emoji: '⛈' },
  99: { label: 'Thunderstorm',       emoji: '⛈' },
};

export function wmoInfo(code) {
  return WMO[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('no-geo');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const url = new URL('https://api.open-meteo.com/v1/forecast');
          url.searchParams.set('latitude',          latitude.toFixed(4));
          url.searchParams.set('longitude',         longitude.toFixed(4));
          url.searchParams.set('current',           'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m');
          url.searchParams.set('hourly',            'temperature_2m,weather_code');
          url.searchParams.set('temperature_unit',  'fahrenheit');
          url.searchParams.set('timezone',          'auto');
          url.searchParams.set('forecast_days',     '1');

          const res = await fetch(url.toString());
          if (!res.ok) throw new Error('fetch failed');
          const data = await res.json();

          setWeather({
            temp:      Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            code:      data.current.weather_code,
            humidity:  data.current.relative_humidity_2m,
            timezone:  data.timezone_abbreviation ?? '',
            hourly:    data.hourly ?? null,
            lat:       latitude.toFixed(2),
            lon:       longitude.toFixed(2),
          });
        } catch {
          setError('unavailable');
        } finally {
          setLoading(false);
        }
      },
      () => { setError('denied'); setLoading(false); }
    );
  }, [trigger]);

  function retryWeather() { setTrigger(t => t + 1); }

  return { weather, error, loading, retryWeather };
}
