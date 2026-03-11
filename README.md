# Trading Backtest System

A full-stack backtesting platform with Python backend and React TypeScript frontend.

## Prerequisites

- Python 3.9-3.11 (recommended: 3.11)
- Node.js 16+

## Quick Start (Current App)

This repo currently runs frontend + backend locally without Docker.

### Linux/Mac (if applicable)

```bash
chmod +x dev.sh
./dev.sh
```

### Windows
```powershell
.\dev.ps1
```

## Lean + Docker Setup (Windows)

Use this section only if you want local Lean backtesting.

### 1) Install Docker Desktop

- Install Docker Desktop for Windows AMD64 (most machines).
- During install:
  - Keep `Use WSL 2 instead of Hyper-V` enabled.
  - Keep `Allow Windows Containers to be used with this installation` disabled.
- Verify Docker:

```powershell
docker --version
docker run hello-world
```
if you have issues here consult a generative AI for instructions, this is just a checking step

### 2) Install Python 3.11

```powershell
winget install -e --id Python.Python.3.11
py -0p
py -3.11 --version
```

### 3) Create backend virtual environment and install dependencies

```powershell
cd C:\Users\cande\StratAlpha
py -3.11 -m venv backend\venv
backend\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
pip install lean
```

### 4) Authenticate Lean CLI

`lean init` can prompt for credentials. If terminal paste behaves badly in the hidden token prompt, use non-interactive login first:

```powershell
cd C:\Users\cande\StratAlpha
backend\venv\Scripts\lean login -u <YOUR_USER_ID> -t "<YOUR_API_TOKEN>"
```

Then initialize Lean workspace:

```powershell
mkdir lean
cd lean
..\backend\venv\Scripts\lean init
```

### 5) Credential notes

- Lean credentials are stored locally in `~/.lean/credentials`.
- Do not commit tokens or credentials to git.
- If `lean init` reports invalid credentials, verify account access and token validity on QuantConnect.

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Stopping the Servers

- **Linux/Mac**: Press `Ctrl+C` in the terminal
- **Windows**: Close the PowerShell windows

## Tech Stack

- **Backend**: Python, FastAPI, Pandas
- **Frontend**: React, TypeScript, Vite, Zustand
- **Charts**: Recharts
