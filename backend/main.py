from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import librosa
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
import tempfile

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_audio(audio: UploadFile = File(...)):
    if audio.content_type not in ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3"]:
        return JSONResponse({"error": "Unsupported file type."}, status_code=400)
    if audio.size and audio.size > 25 * 1024 * 1024:
        return JSONResponse({"error": "File too large."}, status_code=400)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=audio.filename[-4:]) as tmp:
            tmp.write(await audio.read())
            tmp.flush()
            y, sr = librosa.load(tmp.name, sr=None, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)
        # BPM
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        # Key detection (chroma)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        key_idx = np.argmax(chroma_mean)
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = keys[key_idx]
        # Confidence: ratio of max chroma to sum
        key_confidence = float(chroma_mean[key_idx] / (np.sum(chroma_mean) + 1e-6))
        # LUFS (loudness)
        meter = pyln.Meter(sr)
        lufs = float(meter.integrated_loudness(y))
        return {
            "bpm": float(tempo),
            "key": key,
            "key_confidence": key_confidence,
            "lufs": lufs,
            "duration": float(duration)
        }
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500) 