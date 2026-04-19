# Trading Backtest System

A full-stack backtesting platform with Python backend and React TypeScript frontend.

## Prerequisites

- Python 3.9-3.11 (NOT 3.14)
- Node.js 16+

## Getting Started

### Linux/Mac

```bash
chmod +x dev.sh
./dev.sh
```

### Windows

```powershell
.\dev.ps1
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## How the app flow works (high-level)

1. `frontend/src/main.tsx` mounts React and wraps the app in:
   - `BrowserRouter` (for routes)
   - `AuthProvider` (auth state/context)
   - `AuthGate` (protects gated screens)
2. `frontend/src/App.tsx` renders the shared layout:
   - Left sidebar nav
   - Topbar (search, API status, user menu)
   - Main route area
3. Inside `App.tsx`, routes map URL paths to page components:
   - `/` -> `Dashboard`
   - `/backtests` -> `Backtests`
   - `/block` -> `Block`
   - `/strategies` -> `Strategies`
   - `/data` -> `Data`
   - `/analytics` -> `Analytics`
   - `/settings` -> `SettingsPage`

## Stopping the Servers

- **Linux/Mac**: Press `Ctrl+C` in the terminal
- **Windows**: Close the PowerShell windows

## Tech Stack

- **Backend**: Python, FastAPI, Pandas
- **Frontend**: React, TypeScript, Vite, Zustand
- **Charts**: Recharts
