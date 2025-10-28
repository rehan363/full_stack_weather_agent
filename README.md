# Weather Agent

A small full-stack project: a Python FastAPI backend that runs a weather agent and a Next.js frontend (TypeScript + Tailwind) that provides a simple chat-style interface.

This README explains the repository layout, how to run each part locally, problems encountered during development and how they were fixed.

---

## Repository layout

- `app/` — Python FastAPI backend (agent, tools, DB models)
  - `pyproject.toml` — Python project metadata (requires Python >= 3.12)
  - `src/app/` — Python package with `main.py`, `agent.py`, `tools/`, `models.py`, etc.

- `frontend/my-app/` — Next.js frontend (React + TypeScript + Tailwind)
  - `src/app/` — Next.js app routes and React components
  - `src/components/` — UI components
  - `package.json` — frontend dependencies and scripts

---

## Prerequisites

- Node.js (recommend LTS compatible with Next 16; local dev used `npm`)
- Python 3.12+ (see `app/pyproject.toml`)
- Poetry/hatch/pip for installing Python dependencies (project uses `hatchling` for building in pyproject)

---

## Backend (FastAPI)

1. Create and activate a Python environment (example using `venv`):

```powershell
cd e:\learning\weather_agent\app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install Python dependencies (use your preferred tool). Example with pip:

```powershell
pip install -r requirements.txt  # if you add one, or use pip install fastapi uvicorn sqlalchemy openai-agents
```

3. Run the backend (development):

```powershell
cd e:\learning\weather_agent\app
# run uvicorn using the package import path used in this project
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend exposes:
- GET `/` — health
- GET `/weather/{city}` — synchronous tool wrapper
- POST `/ask` — run the weather agent; expects JSON `{ "question": "..." }` and returns `{ "response": "..." }`.

Notes:
- The backend prints and logs the agent output and also stores the query and agent response in the local DB using SQLAlchemy.
- `pyproject.toml` requires Python >= 3.12 and includes core dependencies (FastAPI, uvicorn, openai-agents, SQLAlchemy).

---

## Frontend (Next.js)

1. Install dependencies (from repo root):

```powershell
cd e:\learning\weather_agent\frontend\my-app
npm install --legacy-peer-deps
```

Note: During initial setup a peer dependency conflict with `vaul` and React 19 was encountered. Using `--legacy-peer-deps` was used to install locally for development. A longer-term fix is to align React to a version compatible with all packages or update/remove the conflicting package.

2. Run the dev server:

```powershell
npm run dev
# then open http://localhost:3000
```

3. Build for production:

```powershell
npm run build
npm run start
```

### Important frontend fixes & notes

- Module resolution error: "Cannot find module 'lucide-react' or its corresponding type declarations" was caused by missing `node_modules`. Running `npm install --legacy-peer-deps` restored `lucide-react` and resolved the TypeScript errors.

- CSS import error in `src/app/globals.css`:
  - Error: `CssSyntaxError: Can't resolve 'tw-animate-css'` during Turbopack/PostCSS evaluation.
  - Fix applied: a local copy of the package's distributed CSS was placed at `src/app/tw-animate.css` and `globals.css` was updated to import it via `@import "./tw-animate.css";`. This avoids package subpath export resolution issues with Turbopack. You can instead open an upstream issue for `tw-animate-css` to export the CSS path, or adjust bundler config to allow package CSS subpath imports.

- UI data mapping: The backend returns `{ response: string }`. The frontend now normalizes that response into the UI's `WeatherResponse` shape (attempting to parse JSON if the agent returns structured JSON inside the `response` string). This ensures the UI displays either the agent text or any structured fields the agent included.

---

## Troubleshooting checklist

- If you see TypeScript module errors in VS Code after installing packages:
  - Reload the window (Developer: Reload Window) or restart the TypeScript server (Command Palette → TypeScript: Restart TS server).

- If the frontend cannot reach the backend, confirm backend is running and check CORS origins in `app/src/app/main.py`.

- If CSS build errors persist around `tw-animate-css`, consider:
  - Using the local `src/app/tw-animate.css` (already added), or
  - Updating `tw-animate-css` package to expose the CSS entry via `exports` or changing bundler/PostCSS config.

---

## Recommended next steps

- Create a `requirements.txt` or `constraints.txt` for the backend to simplify setup.
- Resolve peer dependency conflicts cleanly by pinning a compatible React version or updating/removing conflicting packages.
- Add end-to-end tests that exercise the POST `/ask` flow, including sample agent outputs (structured and unstructured) to ensure the frontend mapping stays correct.

---

## Contact

Project author: Rehan Ahmed <rehan007313@gmail.com>

---

License: MIT (add a LICENSE file if needed)
