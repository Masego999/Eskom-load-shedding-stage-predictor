# Eskom Load Shedding Dashboard

A client-side web dashboard that tracks and predicts Eskom load shedding stages using a weighted linear regression model — built as a GIT programme application project.

**Live demo:** *(Deploy to GitHub Pages — see setup below)*

---

## Features

- **Stage predictor** — adjustable inputs (planned outages, unplanned outages, OCGT usage, reserve margin) feed a weighted regression model to predict the likely shedding stage
- **14-day stage history** — visual bar timeline of recent stages
- **Stage distribution** — 30-day breakdown of how often each stage occurred
- **ERF schedule** — estimated restoration times for the current/predicted stage
- **Dark mode** — automatic via `prefers-color-scheme`

---

## Mathematical Model

The predictor uses a weighted linear combination of four grid parameters:

```
Stage ≈ 0.35 × (unplanned / 1000)
      + 0.20 × (planned / 1000)
      + 0.25 × (ocgt% / 100) × 8
      − 0.20 × (reserve / 1000)
```

Result is clamped to the valid range [0, 8] and rounded to the nearest integer.

In a production build, the weights (β) would be trained on real Eskom historical data using the **Normal Equation** (Least-Squares Regression):

```
β = (XᵀX)⁻¹ Xᵀy
```

This is a core BSc Mathematics / Linear Algebra topic and directly maps to real Eskom operational data published in their [System Status reports](https://www.eskom.co.za).

---

## Project Structure

```
eskom-dashboard/
├── index.html     # Markup & page structure
├── style.css      # All styles + dark mode
├── data.js        # Constants, colour maps, helper functions
├── predictor.js   # Regression model, ERF schedule logic
├── ui.js          # DOM rendering functions
├── app.js         # Entry point — init + event wiring
└── README.md
```

---

## Setup

### Run locally

No build tools needed — just open `index.html` in a browser:

```bash
git clone https://github.com/your-username/eskom-dashboard.git
cd eskom-dashboard
open index.html
```

### Deploy to GitHub Pages

1. Push to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root folder
4. Your dashboard will be live at `https://your-username.github.io/eskom-dashboard`

---

## Extending the project

| Feature | How |
|---|---|
| Real-time stage data | Integrate [EskomSePush API](https://eskomsepush.gumroad.com/l/api) (free tier) |
| Train real weights | Collect Eskom System Status CSV data, solve Normal Equation in Python/NumPy |
| Area-based schedule | Map suburb → Eskom area code → ERF schedule from API |
| Push notifications | Service Worker + Web Push API |
| Historical chart | Chart.js with fetched historical stage data |

---

## Technologies

- Vanilla HTML, CSS, JavaScript (no frameworks, no build step)
- CSS custom properties for theming
- Responsive grid layout
- `prefers-color-scheme` dark mode

---

## About

Built by a BSc Computer Science with Mathematics graduate as a GIT programme application project. Demonstrates applied mathematics (linear regression), clean software architecture (separation of concerns), and real-world problem relevance (South African energy infrastructure).
