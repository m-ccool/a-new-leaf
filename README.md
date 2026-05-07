# 🌱 New Leaf API  
*A Full-Stack Interactive Plant Care Assistant*

---

## 📖 Overview  
**New Leaf API** is a portfolio project that bridges technology, data, and nature.  
It allows users to manage their real-life plants through a **virtual 3D greenhouse**, powered by a **REST API**, **React/Three.js front-end**, and a **Node.js + SQL backend**.  

With over **3,000 plant species entries**, the application provides tailored care schedules, environmental insights, and immersive 3D visualizations.

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

