# Taal Audio Analysis Web App

A modern web app for analyzing audio files (MP3/WAV) to extract BPM, musical key, key confidence, LUFS (loudness), and duration. Built with React, Tailwind CSS, FastAPI, and designed for easy deployment on Vercel (frontend) and Railway (backend).

---

## Features
- Drag-and-drop or click-to-upload audio files (MP3/WAV, up to 25MB)
- Instant analysis: BPM, Key, Key confidence %, LUFS, Duration
- Neon/dark UI inspired by professional audio tools
- No login required; all results are client-side only

---

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Python FastAPI
- **Hosting:** Vercel (frontend), Railway (backend)

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-root>
```

### 2. Frontend Setup (React + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev # or npm start
```

#### Deploy to Vercel
- Push your frontend code to GitHub
- Import the repo in [Vercel](https://vercel.com/)
- Set build command: `npm run build`
- Set output directory: `dist` or `build` (depending on setup)

### 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Deploy to Railway
- Push your backend code to GitHub
- Create a new project in [Railway](https://railway.app/)
- Connect your repo and deploy

---

## API Reference
- **POST** `/analyze`
  - Body: Multipart form-data with file (`audio`)
  - Response: `{ bpm, key, key_confidence, lufs, duration }`

---

## License
MIT 