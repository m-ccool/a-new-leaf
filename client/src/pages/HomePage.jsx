import { useState, useEffect } from 'react';
import { usePlants } from '../context/PlantContext';
import { useTimeTheme } from '../hooks/useTimeTheme';
import { useWeather } from '../hooks/useWeather';
import { MODELS } from '../hooks/usePlantAPI';
import PlantCard from '../components/PlantCard';
import PlantCardSkeleton from '../components/PlantCardSkeleton';
import PlantViewer from '../components/PlantViewer';
import AddPlantModal from '../components/AddPlantModal';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import WeatherWidget from '../components/WeatherWidget';
import WeatherModal from '../components/WeatherModal';
import SkyOrb from '../components/SkyOrb';
import PlantDetailModal from '../components/PlantDetailModal';

const SKELETON_COUNT = 4;

export default function HomePage() {
  const { plants, addPlant, user, getWaterLevel, settings } = usePlants();
  const theme = useTimeTheme(settings?.themeOverride ?? null);
  const { weather, loading: weatherLoading } = useWeather();
  const [showAdd, setShowAdd]           = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeather, setShowWeather]   = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [loading, setLoading]           = useState(true);

  // Brief skeleton flash on first mount for polish
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const needsWater = plants.filter(p => getWaterLevel(p) < 30).length;
  const avatarModel = MODELS[user.avatarModelIdx ?? 0];

  function handleAdd(plant) {
    addPlant(plant);
    setShowAdd(false);
  }

  return (
    <div
      className="app"
      data-theme={theme.name}
      data-glass={settings?.darkMode ? 'dark' : 'light'}
      style={{ background: theme.bg, backgroundAttachment: 'fixed' }}
    >
      <SkyOrb themeName={theme.name} weather={weather} />

      {/* Nav */}
      <nav className="navbar">
        <button
          className="navbar__icon-btn"
          onClick={() => setShowProfile(true)}
          aria-label="Open profile"
          title={user.name}
        >
          <div className="navbar__avatar-model">
            <PlantViewer modelUrl={avatarModel} height={40} />
          </div>
        </button>

        <div className="navbar__brand">
          A New Leaf
        </div>

        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          onClick={() => setShowWeather(true)}
        />
      </nav>

      {/* Gallery */}
      <main className="gallery">
        {!loading && plants.length === 0 ? (
          <div className="gallery__empty">
            <span className="gallery__empty-icon">🪴</span>
            <p>Your window sill is empty.</p>
            <p>Tap + below to add your first plant.</p>
          </div>
        ) : (
          <div className="gallery__grid">
            {loading
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => <PlantCardSkeleton key={i} />)
              : plants.map(p => <PlantCard key={p.id} plant={p} onCardClick={setSelectedPlant} />)
            }
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className="bottombar">
        <button className="bottombar__btn bottombar__btn--active" aria-label="Garden view">
          <span className="bottombar__btn-icon">🌱</span>
          <span className="bottombar__btn-label">Garden</span>
          {needsWater > 0 && <span className="bottombar__badge">{needsWater}</span>}
        </button>

        <button
          className="bottombar__btn bottombar__btn--add"
          onClick={() => setShowAdd(true)}
          aria-label="Add plant"
        >
          <span className="bottombar__btn-icon bottombar__btn-icon--add">＋</span>
        </button>

        <button
          className="bottombar__btn"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <span className="bottombar__btn-icon">⚙️</span>
          <span className="bottombar__btn-label">Settings</span>
        </button>
      </footer>

      {showAdd      && <AddPlantModal  onAdd={handleAdd}          onClose={() => setShowAdd(false)} />}
      {showProfile  && <ProfileModal                              onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal                             onClose={() => setShowSettings(false)} />}
      {showWeather  && weather && <WeatherModal weather={weather} onClose={() => setShowWeather(false)} />}
      {selectedPlant && <PlantDetailModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} />}
    </div>
  );
}
