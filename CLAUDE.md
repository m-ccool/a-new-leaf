# CLAUDE.md — A New Leaf · Agent Contract

> This file is the **single source of truth** for any Claude agent working in this repo.
> It supersedes inline comments, ad-hoc instructions, and prior session memory.
> Every response must be traceable to a section in this file.

---

## 1. Project Identity

**App Name:** A New Leaf
**Type:** Plant care companion — virtual 3D greenhouse + smart care assistant
**Owner:** Solo full-stack developer (freelance, 12+ yrs, systems admin background)
**Repo:** `m-ccool/a-new-leaf` (GitHub, branch `main`)
**Live URL:** https://m-ccool.github.io/a-new-leaf/
**Tagline:** Your personal garden, in your pocket.

---

## 2. Tech Stack (Canonical)

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React (CRA) | No Vite, no Next.js unless explicitly migrated |
| UI | Vanilla CSS, CSS custom properties | No Tailwind. No UI libs beyond Headless UI |
| Primitives | `@headlessui/react` | Modals, comboboxes, switches only |
| 3D | Three.js via custom `PlantViewer` | `.glb` models in `/public/models/` |
| State | React Context API + `useLocalStorage` | No Redux, no Zustand |
| Data persistence | `localStorage` (key prefix `anl_`) | All data is local-first |
| Weather | Open-Meteo API (free, no key) | GPS via browser geolocation |
| Plant API | Perenual API v2 | Key in `.env.local`, never committed |
| Deployment (web) | GitHub Pages via Actions | Branch: `main`, workflow in `.github/` |
| Deployment (mobile) | Capacitor (future) | Wrap existing React build — no rewrite |
| Store targets | iOS App Store + Google Play | Capacitor + native plugins when mobile phase begins |

---

## 3. Design System (Enforce Always)

### Color Tokens (CSS custom properties — never hardcode hex)
```
--accent          user-chosen accent, default #52b788 (green)
--green           #3d9c68
--green-mid       #52b788
--red             #ef4444
--amber           #f59e0b
--blue            #38bdf8
--text            rgba(255,255,255,0.95)
--text-muted      rgba(255,255,255,0.58)
--glass-bg        rgba(255,255,255,0.13)
--glass-border    rgba(255,255,255,0.30)
--glass-blur      blur(24px) saturate(180%)
```

### Typography (iOS HIG scale — enforce strictly)
```
Large Title  34px / 700 — page headers
Title 1      28px / 700
Title 2      22px / 700
Title 3      20px / 600
Headline     17px / 600
Body         17px / 400
Callout      16px / 400
Subheadline  15px / 400
Footnote     13px / 400
Caption 1    12px / 400
Caption 2    11px / 400
```

### Spacing (4pt grid — enforce strictly)
`4 8 12 16 20 24 32 44px` — use `--sp-N` tokens from CSS.

### Border Radius Scale
```
--radius-xs    8px   (chips, badges)
--radius-sm   12px   (inputs)
--radius      16px   (cards)
--radius-lg   20px   (modals, sheets)
--radius-full 100px  (pills, FABs)
```

### Motion
- Easing: `--ease-ios` (cubic-bezier(0.25, 0.46, 0.45, 0.94)) for all transitions
- Spring: `--ease-spring` (cubic-bezier(0.34, 1.56, 0.64, 1)) for confirmations/pops
- Duration: 180ms standard, 300ms for modals, 120ms for micro-interactions
- No gratuitous animation. Every motion must convey state or hierarchy.

### Themes (time-of-day, auto + manual override)
`night | dawn | morning | midday | afternoon | dusk`
Each sets `data-theme` on `.app` and `document.body`. CSS vars react automatically.

### Glass aesthetic
Liquid Glass (iOS 18-style): `backdrop-filter: blur(24px) saturate(180%)`.
All cards, modals, and panels use glass — never opaque flat fills.

---

## 4. Data Architecture (Local-First, Zero Hosting Cost)

### localStorage keys (prefix `anl_`)
| Key | Contents |
|---|---|
| `anl_plants_v2` | Array of user plant objects |
| `anl_user` | Profile: name, bio, avatarModelIdx, gardenName, accent, streak, lastWateredDay |
| `anl_settings` | darkMode, notifications, themeOverride, isPro, lastTipDate |

### Plant object shape
```js
{
  id: timestamp,        // Date.now() at add time
  addedAt: timestamp,
  lastWatered: timestamp,
  nickname: string,
  species: {
    id: number | "api-{id}",
    name: string,
    latin: string,
    model: "/models/plant-N.glb",
    water: "Low|Medium|High|Frequent|Average|Minimum",
    waterFreqDays: number,   // computed from water string
    light: string,
    temp: string,            // "~70°F"
    toxic: boolean,
    perenualId: number,      // Perenual API ID for detail fetch
  }
}
```

### No backend, no user accounts, no server costs
All data lives in the browser / native device storage.
On mobile (Capacitor): use `@capacitor/preferences` instead of `localStorage`.
Cloud backup: iCloud (iOS Keychain / Files) and Google Play Games (Android) — native Capacitor plugins only, user-opt-in.
**Never route user data through a developer-controlled server.**

---

## 5. Feature Map (Free vs Pro)

### Free (always)
- Add unlimited plants (no paywall on core function)
- 3D plant gallery with all 11 GLB models
- Water level tracking + happiness algorithm
- Live weather integration (Open-Meteo, GPS)
- Time-of-day sky themes (auto + manual)
- Daily plant tip banner
- Watering streak + garden grade (A–F)
- Accent color picker (5 standard colors)
- Profile: name, bio, avatar model
- Settings: dark mode, theme override, notification toggle
- Toxic/pet-safe badge on plant cards
- Offline mode (PWA service worker)
- Demo mode (`?demo=1`)

### Pro ($1.99 one-time IAP — no subscription, no recurring cost)
**Rationale:** Zero hosting cost per user = no need for subscription. One-time purchase reduces friction and churn.
Apple/Google take 15–30%; net ~$1.40–$1.70 per sale. No server overhead.

- Perenual plant encyclopedia (10k+ species search)
- AI disease & pest identification panel
- Extended species database
- **Photo journal** — one photo per plant, stored on device
- **Seasonal care calendar** — month-by-month care guide per species
- **Plant health log** — timestamped event history (watered, repotted, fertilized, etc.)
- **Advanced stats** — water consistency score, streak graph, garden health over time
- **Custom accent colors** — 5 additional accent options + hex input
- **iCloud / Google Drive backup** — export/import garden JSON (Capacitor native, opt-in)
- **Reminder scheduling** — set specific watering time notifications per plant
- All future Pro features included at purchase

### Pricing display in SubscriptionModal
- Lead with value: what Pro solves, not what it costs
- Price: **$1.99 — one time, forever**
- No "trial expired", no renewal, no upsell after purchase
- Post-purchase: show Pro badge, unlock features immediately

---

## 6. Component Map (Current)

| File | Role |
|---|---|
| `App.js` | Root — PlantProvider wraps HomePage |
| `pages/HomePage.jsx` | Full app shell — nav, gallery, modals, tip banner |
| `context/PlantContext.js` | Global state: plants, user, settings, weather |
| `hooks/useLocalStorage.js` | Persistent state hook |
| `hooks/usePlantAPI.js` | Perenual API: search, details, disease, mappers |
| `hooks/useTimeTheme.js` | Time-of-day theme computation |
| `hooks/useWeather.js` | Open-Meteo weather fetch + GPS |
| `components/PlantCard.jsx` | Gallery card — water bar, happy bar, actions |
| `components/PlantCardSkeleton.jsx` | Loading placeholder |
| `components/PlantViewer.jsx` | Three.js GLB renderer — compact + full modes |
| `components/AddPlantModal.jsx` | Add plant: nickname + species picker + model |
| `components/PlantDetailModal.jsx` | Detail sheet: Perenual data, care guide |
| `components/DiseasePanel.jsx` | Disease/pest identification (Pro) |
| `components/SpeciesPanel.jsx` | Species encyclopedia browser (Pro) |
| `components/ProfileModal.jsx` | User profile edit |
| `components/SettingsModal.jsx` | App settings |
| `components/SubscriptionModal.jsx` | Free/Pro paywall + feature list |
| `components/WeatherWidget.jsx` | Live weather pill in navbar |
| `components/WeatherModal.jsx` | Expanded weather detail |
| `components/DailyTipModal.jsx` | Daily tip sheet |
| `components/LockBadge.jsx` | Pro lock overlay on locked features |
| `components/SkyOrb.jsx` | Animated sky element — theme reactive |
| `data/species.js` | 11 local species entries (static seed) |
| `data/tips.js` | Daily tips by species + generic |
| `styles/app.css` | Design system — Liquid Glass v4 |

---

## 7. MVP Status (Current)

### Done
- [x] React PWA shell, CRA, GitHub Pages deploy
- [x] Liquid Glass Design System v4 (CSS tokens, themes, glass)
- [x] Time-of-day sky themes (6 slots, auto + manual)
- [x] Plant gallery with 3D GLB viewer (Three.js)
- [x] Add plant flow: local species picker + Perenual API search
- [x] Water level + happiness algorithm (weather-aware)
- [x] Watering streak + garden grade
- [x] Daily tip banner + modal
- [x] Profile modal (name, bio, avatar model, accent)
- [x] Settings modal (dark mode, theme, notifications)
- [x] Weather widget + modal (Open-Meteo)
- [x] Disease panel (Pro-gated, Perenual)
- [x] Species panel (Pro-gated, Perenual)
- [x] Subscription modal (Free/Pro UI, local toggle)
- [x] Demo mode (`?demo=1`)
- [x] PWA service worker + manifest

### In Progress / Next
- [ ] Photo journal per plant (Pro) — device camera + local storage
- [ ] Plant health log — event history (watered, repotted, fertilized)
- [ ] Seasonal care calendar — month view per species
- [ ] Advanced stats dashboard — streak graph, consistency score
- [ ] Capacitor mobile wrapper — iOS + Android
- [ ] iCloud / Google Drive backup (Capacitor, Pro, opt-in)
- [ ] Reminder scheduling — per-plant notification time (Capacitor push)
- [ ] Perenual species detail fetch in PlantDetailModal (Pro gate)
- [ ] LockBadge applied consistently to all Pro surfaces

---

## 8. Deployment Path

### Phase 1 — Web (active)
- React PWA, deployed via GitHub Actions to GitHub Pages
- Service worker for offline caching
- `manifest.json` for installable PWA on mobile browser

### Phase 2 — Mobile (next)
```
npm install @capacitor/core @capacitor/cli
npx cap init "A New Leaf" com.anewleaf.app
npm run build
npx cap add ios
npx cap add android
npx cap sync
```
- No React rewrite required — Capacitor wraps the existing React build
- Replace `localStorage` calls with `@capacitor/preferences` for native storage
- Add `@capacitor/camera` for photo journal
- Add `@capacitor/local-notifications` for reminder scheduling
- Add `@capacitor/filesystem` + iCloud/Drive for backup

### Store targets
- **iOS:** App Store (Xcode + Apple Developer Program $99/yr)
- **Android:** Google Play ($25 one-time registration)
- IAP: RevenueCat (free tier, handles iOS/Android purchase verification)

---

## 9. Agent Operating Rules

### Must always
- Read the relevant files before suggesting any change
- Use CSS custom properties from the design system — never hardcode hex, px, or timing values
- Produce complete, copy-paste-runnable files — no partials, no `// ... rest of code`
- Cite the section of this file that authorizes the change
- Confirm bugs fixed by running a test or reading corrected output before declaring resolved
- Apply the 4pt spacing grid and iOS HIG type scale to any new UI
- End every technical answer with exactly 3 numbered follow-up questions

### Must never
- Add npm dependencies without explicit justification and user approval
- Redesign or restyle components not mentioned in the active request
- Push, pull, or sync git without explicit user confirmation
- Substitute fake/demo data as UI truth
- Edit README.md without explicit user request
- Expand scope beyond the active request
- Use Tailwind, styled-components, or any CSS-in-JS approach
- Hardcode the Perenual API key — always use `process.env.REACT_APP_PERENUAL_KEY`
- Create markdown documentation files unless explicitly requested

### Change discipline
- Smallest targeted change that satisfies the request
- Preserve all existing component APIs, prop shapes, and localStorage key names
- No opportunistic cleanup, refactors, or "while I'm in here" edits
- If a change requires touching >3 unrelated files, stop and confirm scope first

### Pro gate discipline
- All Pro-gated features check `settings?.isPro`
- LockBadge component wraps locked UI surfaces
- SubscriptionModal opens on any locked feature tap
- Never remove free features to pad Pro tier

### Data safety
- Never break existing `anl_` localStorage keys — schema changes require migration logic
- `waterFreqDays` computed from `water` string must survive across plant object round-trips
- Demo plants (`?demo=1`) must not persist to real user data on reload

---

## 10. Session Kickoff (Copy-Paste Template)

```
## Session — A New Leaf

Branch: main
Last commit: [describe]
State: [what's working / what's broken]

This session goal: [one sentence]

Constraints:
- Do NOT redesign existing components
- Do NOT add deps without approval
- Preserve all anl_ localStorage keys
- Web-first, Capacitor-ready architecture
```

---

## 11. Perenual API Reference

**Base V2:** `https://perenual.com/api/v2`
**Base V1:** `https://perenual.com/api`
**Key:** `process.env.REACT_APP_PERENUAL_KEY` (never inline)

| Endpoint | Use |
|---|---|
| `GET /v2/species-list?key=K&q=QUERY` | Species search |
| `GET /v2/species/details/{id}?key=K` | Full species detail |
| `GET /v1/pest-disease-list?key=K` | Disease/pest list |

Perenual images: use `default_image.medium_url` — can be `null`, always guard.

---

## 12. Confirmed Repo Facts

- CRA (Create React App) — not Vite, not Next.js
- Headless UI v2 (`@headlessui/react`) — Dialog uses `DialogPanel`, not `Dialog.Panel`
- GLB models: `/public/models/plant-1.glb` through `plant-10.glb` + `plant-6.5.glb`
- 11 models total, indexed via `MODELS` array in `usePlantAPI.js`
- `useLocalStorage` is a custom hook — not a third-party lib
- GitHub Actions deploy targets `main` branch
- `.env.local` holds Perenual key — never committed
- No backend in this repo — all API calls are client-side
- `isDemo` is URL-param driven (`?demo=1`), not a settings flag
