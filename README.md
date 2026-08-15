# 🏎️ F1 RACE LAB: Real-Time Race Analytics & Counterfactual ML Strategy Simulator

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![FastF1](https://img.shields.io/badge/Data_Pipeline-FastF1_v3.4-E10600?style=for-the-badge)](https://docs.fastf1.dev/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)

---

## 🌟 Executive Summary

**F1 Race Lab** is a professional-grade Formula 1 strategy, telemetry, and machine learning analytics platform. Built for strategy engineers and racing enthusiasts, F1 Race Lab processes real **FastF1 telemetry** to reconstruct authentic 2D circuit geometries, run **counterfactual "Ghost Race" simulations**, predict **tyre degradation curves**, and model stochastic race outcomes via a **Monte Carlo Engine**.

Inspired by real F1 pit-wall telemetry consoles, the application features a **Light Motorsport aesthetic** with clean typography, standardized compound colors (`SOFT` Red, `MEDIUM` Yellow, `HARD` Gray, `INTERMEDIATE` Green, `WET` Blue), and prominent driver position badges.

---

## 🔥 Key Features & Capabilities

### 1. 📍 Real FastF1 Positional Circuit Geometry & Telemetry
- **Authentic Circuit Tracks**: Dynamically extracts X/Y positional telemetry for any Grand Prix event (*Monza*, *Monaco*, *Silverstone*, *Spa-Francorchamps*, *Suzuka*, etc.).
- **Zero Oval Approximations**: Renders true corner apexes (*Variante del Rettifilo*, *Curva Grande*, *Lesmo*, *Ascari*, *Parabolica*), sector markers, and turn numbers (`T1`, `T2`, `T3`...).
- **Prominent Driver Labels**: Displays high-contrast driver badges (`NOR`, `VER`, `LEC`, `HAM`, `PIA`, `RUS`, `ALO`) directly at physical telemetry positions on the racing line.

### 2. 👻 Counterfactual "Ghost Race" Strategy Simulator
- **What-If Strategy Branching**: Simulates alternative pit stop strategies (e.g., *"What if Hamilton pitted on Lap 18 for Hard tyres instead of staying out?"*).
- **Dual Car Pathing**: Renders the solid Real Car alongside an animated glowing amber Ghost Car on the exact same circuit geometry.
- **Cascading Grid Impact**: Calculates net time gain/loss and re-simulates the entire driver grid finish order.

### 3. 📈 Machine Learning Tire Degradation & Pace Predictor
- **Compound Degradation Curves**: Pre-trained Scikit-Learn regression models (`deg_model.joblib`, `lap_model.joblib`) predicting lap-by-lap tyre degradation and stint pace.
- **Interactive Plotly Visualizations**: Dynamic degradation charts comparing tire wear across compounds and lap ages.

### 4. 🎲 Stochastic Monte Carlo Strategy Engine
- **Multi-Scenario Simulations**: Runs 1,000+ stochastic race iterations factoring in safety car probability, pit loss time, traffic delays, and weather changes.
- **Win & Podium Probabilities**: Generates data-driven strategy decision confidence metrics.

### 5. ⏳ Race Time Machine & Interactive Replay Controls
- **Interactive Timeline Playback**: Play, pause, scrub, and adjust speed (`1x` to `10x`) across race laps.
- **Horizontal Stint Timeline**: Visualizes driver tire stint progression, compound choices, and pit stop windows.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript, TailwindCSS, Plotly.js, Lucide Icons |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic |
| **Data Engine** | FastF1 (Official F1 Telemetry API), Pandas, NumPy |
| **Machine Learning** | Scikit-Learn, Joblib (Degradation & Lap Time Predictors) |

---

## 🚀 Getting Started

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.0` or higher (`npm` included)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will be available at: **`http://localhost:8000`**  
API Documentation (Swagger UI): **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The application will be live at: **`http://localhost:5173`**

---

## 📁 Repository Structure

```text
f1-race-lab/
├── backend/
│   ├── main.py               # FastAPI server endpoints
│   ├── requirements.txt      # Python dependencies
│   ├── models/               # Pre-trained ML models & column specs
│   │   ├── deg_model.joblib
│   │   └── lap_model.joblib
│   └── services/
│       ├── fastf1_service.py # FastF1 telemetry & geometry pipeline
│       └── ml_service.py     # Ghost Race & Monte Carlo simulation engines
├── frontend/
│   ├── package.json          # Frontend dependencies & scripts
│   ├── vite.config.ts        # Vite build configuration
│   └── src/
│       ├── App.tsx           # Dashboard layout & state management
│       ├── components/       # CircuitTrackMap, GhostRaceCard, StintTimelineCard, etc.
│       ├── services/         # API integration client
│       └── types/            # TypeScript interfaces
└── .gitignore                # Git exclusions (venv, node_modules, cache)
```

---



---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
