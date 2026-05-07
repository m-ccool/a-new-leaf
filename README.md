# 🌱 New Leaf API  
*A Full-Stack Interactive Plant Care Assistant*

---

## 📖 Overview  
**New Leaf API** is a portfolio project that bridges technology, data, and nature.  
It allows users to manage their real-life plants through a **virtual 3D greenhouse**, powered by a **REST API**, **React/Three.js front-end**, and a **Node.js + SQL backend**.  

With over **3,000 plant species entries**, the application provides tailored care schedules, environmental insights, and immersive 3D visualizations.

## MVP Outline Status

- Frontend MVP is implemented in the `client` app: plant gallery, 3D model viewer, plant detail modal, weather widget, and species/disease panels.
- Deployment path is configured for GitHub Pages via GitHub Actions workflow runs.
- Backend/API server and SQL persistence referenced in this README are not present in this repository snapshot.
- Current delivery target is reliable static deployment from the `dev` branch workflow.

## Shortest Path To Live UI Readback

1. Push changes to the `dev` branch to trigger the Pages deploy workflow.
2. Ensure repository Actions secrets exist for `REACT_APP_PERENUAL_KEY` and `REACT_APP_OPENWEATHER_KEY`.
3. Wait for the Deploy to GitHub Pages workflow to pass build and deploy jobs.
4. Open the live site at https://m-ccool.github.io/a-new-leaf/ and verify key UI surfaces render.

---

## ✨ Features  

- **🌍 Real-World Plant Database**  
  - 3k+ species with biome preference, water needs, sunlight requirements, and bloom cycles.  

- **📌 User Plant Profiles**  
  - Add personal plants with custom names.  
  - Displayed in a responsive **virtual window sill gallery**.  

- **🧭 Smart Care Reminders**  
  - Watering and sunlight notifications based on database rules.  
  - Integrates **GPS & live weather data** to adjust schedules dynamically.  

- **🪴 Interactive 3D Models**  
  - Rotating **3D plant skins** for each profile.  
  - **Touch responsive** — twirl, spin, and inspect plants.  
  - Expanding gallery cards with smooth transitions.  

- **📱 Responsive Design**  
  - Square card gallery for quick overview.  
  - Mobile-friendly UI with interactive elements.  

---

## 🛠️ Tech Stack  

### **Frontend**
- React.js  
- Three.js (3D rendering & interaction)  
- HTML5 / CSS3  

### **Backend**
- Node.js + Express.js (REST API)  
- SQL Database (seeded with 3k+ plant species)  

### **APIs & Integrations**
- Weather + GPS services for adaptive reminders  
- Custom scheduling logic for bloom/water intervals  
- **Perenual Plant API** — 10,000+ real species with care data  

---

## 🌿 Perenual Plant API

**Documentation:** https://perenual.com/docs/api  
*(Includes example responses and code snippets)*

**API Key:** `sk-0JgV69fa5794469cc17020`  
> Store in `client/.env.local` as `REACT_APP_PERENUAL_KEY=sk-0JgV69fa5794469cc17020`  
> This file is `.gitignore`d and never committed.

### Endpoints

**Plant Species List**
```
GET https://perenual.com/api/v2/species-list?key=sk-0JgV69fa5794469cc17020
```

**Plant Details**
```
GET https://perenual.com/api/v2/species/details/[ID]?key=sk-0JgV69fa5794469cc17020
```

**Plant Disease List**
```
GET https://perenual.com/api/pest-disease-list?key=sk-0JgV69fa5794469cc17020
```

---

