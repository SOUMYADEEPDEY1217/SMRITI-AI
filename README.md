# SMRITI-AI — AI Cognitive Care Platform

An AI-powered cognitive care platform for memory support and cognitive stimulation. The project is organized as a monorepo with clearly separated **frontend** and **backend** directories.

## Project Structure

```
SIH/
├── frontend/         # React + Vite frontend
│   ├── src/          # Components, pages, activities, utils, styles
│   ├── public/       # Static assets
│   ├── index.html    # Vite entry point
│   ├── vite.config.js
│   └── package.json
├── backend/          # FastAPI Python backend
│   ├── app/          # Application modules (routers, services)
│   ├── main.py       # App entrypoint
│   └── requirements.txt
├── package.json      # Root convenience scripts
└── README.md
```

## Quick Start

### Frontend

```bash
# From the project root (convenience scripts):
npm run dev        # starts Vite dev server at http://localhost:5173

# Or directly from the frontend directory:
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend API serves at `http://localhost:8000`. The frontend expects it there (configured in `frontend/src/data/api.js`).

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite 8, Chart.js         |
| Backend  | FastAPI, Pydantic, SlowAPI          |
| AI/ML    | Google Gemini, Ollama (LLaVA)       |
| Storage  | Firebase, Cloudinary                |
