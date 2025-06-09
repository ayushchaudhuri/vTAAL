from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import librosa
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
import tempfile
import os

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3"]
MAX_SIZE = 25 * 1024 * 1024

KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

@app.post("/analyze")
async def analyze_audio(audio: UploadFile = File(...)):
    if not audio:
        return JSONResponse({"error": "No file uploaded."}, status_code=400)
    if audio.content_type not in ALLOWED_TYPES:
        return JSONResponse({"error": "Unsupported file type. Please upload an MP3 or WAV file."}, status_code=400)
    if hasattr(audio, 'size') and audio.size and audio.size > MAX_SIZE:
        return JSONResponse({"error": "File too large. Maximum allowed size is 25MB."}, status_code=400)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[-1]) as tmp:
            tmp.write(await audio.read())
            tmp.flush()
            y, sr = librosa.load(tmp.name, sr=None, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)
        if duration == 0:
            return JSONResponse({"error": "Audio file appears to be empty or corrupted."}, status_code=400)
        # BPM
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        # Key detection (improved)
        chroma_cqt = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_cqt_mean = np.mean(chroma_cqt, axis=1)
        chroma_stft_mean = np.mean(chroma_stft, axis=1)
        key_idx_cqt = np.argmax(chroma_cqt_mean)
        key_idx_stft = np.argmax(chroma_stft_mean)
        key_cqt = KEYS[key_idx_cqt]
        key_stft = KEYS[key_idx_stft]
        # Confidence: average of both chroma methods
        conf_cqt = float(chroma_cqt_mean[key_idx_cqt] / (np.sum(chroma_cqt_mean) + 1e-6))
        conf_stft = float(chroma_stft_mean[key_idx_stft] / (np.sum(chroma_stft_mean) + 1e-6))
        # Use the key with the higher confidence
        if conf_cqt >= conf_stft:
            key = key_cqt
            key_confidence = (conf_cqt + conf_stft) / 2
        else:
            key = key_stft
            key_confidence = (conf_cqt + conf_stft) / 2
        # Tuning offset (optional, for more accuracy)
        tuning = librosa.estimate_tuning(y=y, sr=sr)
        # LUFS (loudness)
        meter = pyln.Meter(sr)
        lufs = float(meter.integrated_loudness(y))
        return {
            "bpm": float(tempo),
            "key": key,
            "key_confidence": key_confidence,
            "lufs": lufs,
            "duration": float(duration),
            "tuning": float(tuning)
        }
    except Exception as e:
        msg = str(e)
        if 'NoBackendError' in msg or 'ffmpeg' in msg:
            return JSONResponse({"error": "Audio decoding failed. Please upload a valid MP3 or WAV file."}, status_code=400)
        return JSONResponse({"error": f"Analysis failed: {msg}"}, status_code=500) 