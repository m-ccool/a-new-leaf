import { useState, useEffect, useMemo } from 'react';
import { usePlants } from '../context/PlantContext';
import { useTimeTheme } from '../hooks/useTimeTheme';
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
import DiseasePanel from '../components/DiseasePanel';
import DailyTipModal from '../components/DailyTipModal';
import SubscriptionModal from '../components/SubscriptionModal';
import SpeciesPanel from '../components/SpeciesPanel';
import { PLANT_TIPS } from '../data/tips';

const SKELETON_COUNT = 4;

export default function HomePage() {
  const { plants, addPlant, user, setUser, getWaterLevel, settings, setSettings, weather, weatherLoading, isDemo } = usePlants();
  const theme = useTimeTheme(settings?.themeOverride ?? null);
  const [showAdd, setShowAdd]           = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeather, setShowWeather]   = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [diseasePlant, setDiseasePlant]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [learnPlant, setLearnPlant] = useState(null);

  // Pick a daily tip based on user's plants or a generic one
  const dailyTip = useMemo(() => {
    if (plants.length > 0) {
      const pick = plants[Math.floor(Math.random() * plants.length)];
      const speciesTip = PLANT_TIPS.find(t => t.speciesId === pick.species?.id);
      if (speciesTip) return { tip: speciesTip, plant: pick };
    }
    const generic = PLANT_TIPS.filter(t => t.speciesId === null);
    return { tip: generic[Math.floor(Math.random() * generic.length)], plant: null };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date().toDateString();
  const showTipBanner = !loading && settings?.lastTipDate !== today;

  function startEditTitle() {
    setTitleDraft(user.gardenName ?? 'My Garden');
    setEditingTitle(true);
  }

  function commitTitle() {
    const name = titleDraft.trim() || 'My Garden';
    setUser({ ...user, gardenName: name });
    setEditingTitle(false);
  }

  function handleTitleKey(e) {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') setEditingTitle(false);
  }

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

  function dismissTip() {
    setSettings(prev => ({ ...prev, lastTipDate: today }));
  }

  return (
    <div
      className="app"
      data-theme={theme.name}
      data-glass={settings?.darkMode ? 'dark' : 'light'}
      style={{ backgroundImage: theme.bg }}
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

        <div className="navbar__brand-wrap">
          {editingTitle ? (
            <input
              className="navbar__brand-input"
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKey}
              autoFocus
              maxLength={32}
              aria-label="Garden name"
            />
          ) : (
            <div className="navbar__brand" onClick={startEditTitle} title="Tap to rename">
              {user.gardenName ?? 'My Garden'}
            </div>
          )}
        </div>

        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          onClick={() => setShowWeather(true)}
        />
      </nav>

      {/* Demo chip */}
      {isDemo && (
        <div className="demo-chip">🌿 Demo Mode</div>
      )}

      {/* Daily Tip Banner */}
      {showTipBanner && dailyTip?.tip && (
        <div
          className="daily-tip-banner"
          onClick={() => setShowTipModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setShowTipModal(true)}
        >
          <span className="daily-tip-banner__emoji">{dailyTip.tip.emoji}</span>
          <div className="daily-tip-banner__text">
            {dailyTip.plant?.name ?? 'Plant Fact'}
            <span className="daily-tip-banner__sub"> · Tap to learn more</span>
          </div>
          <span className="daily-tip-banner__caret">›</span>
          <button
            className="daily-tip-banner__dismiss"
            onClick={e => { e.stopPropagation(); dismissTip(); }}
            aria-label="Dismiss tip"
          >✕</button>
        </div>
      )}

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
              : plants.map(p => <PlantCard key={p.id} plant={p} onCardClick={setSelectedPlant} onLearn={p => setLearnPlant(p)} />)
            }
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className="bottombar">
        <button
          className="bottombar__btn bottombar__btn--add"
          onClick={() => setShowAdd(true)}
          aria-label="Add plant"
        >
          <span className="bottombar__btn-icon bottombar__btn-icon--add">＋</span>
        </button>

        <div className="bottombar__pill">
          <span className={`bottombar__pill__slider${showSettings ? ' bottombar__pill__slider--right' : ''}`} />
          <button
            className={`bottombar__btn${!showSettings ? ' bottombar__btn--active' : ''}`}
            onClick={() => setShowSettings(false)}
            aria-label="Garden view"
          >
            <span className="bottombar__btn-icon">🌱</span>
            <span className="bottombar__btn-label">Garden</span>
            {needsWater > 0 && <span className="bottombar__badge">{needsWater}</span>}
          </button>

          <button
            className={`bottombar__btn${showSettings ? ' bottombar__btn--active' : ''}`}
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <span className="bottombar__btn-icon">⚙️</span>
            <span className="bottombar__btn-label">Settings</span>
          </button>
        </div>
      </footer>

      {showAdd      && <AddPlantModal  onAdd={handleAdd}          onClose={() => setShowAdd(false)} />}
      {showProfile  && <ProfileModal                              onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onUpgrade={() => setShowSubscription(true)} onClose={() => setShowSettings(false)} />}
      {showWeather  && weather && <WeatherModal weather={weather} onClose={() => setShowWeather(false)} />}
      {selectedPlant && <PlantDetailModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} onLearn={p => { setSelectedPlant(null); setLearnPlant(p); }} onCheckup={p => { setSelectedPlant(null); setDiseasePlant(p); }} />}
      {diseasePlant  && <DiseasePanel onClose={() => setDiseasePlant(null)} />}
      {showTipModal && dailyTip?.tip && (
        <DailyTipModal
          tip={dailyTip.tip}
          plantName={dailyTip.plant?.name ?? null}
          modelUrl={dailyTip.plant?.species?.model ?? null}
          onClose={() => { setShowTipModal(false); dismissTip(); }}
        />
      )}
      {showSubscription && <SubscriptionModal onClose={() => setShowSubscription(false)} />}
      {learnPlant && (
        <SpeciesPanel
          species={learnPlant.species}
          onClose={() => setLearnPlant(null)}
          onUpgrade={() => { setLearnPlant(null); setShowSubscription(true); }}
        />
      )}
    </div>
  );
}
