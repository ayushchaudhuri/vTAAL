import React, { useState } from 'react';

const initialResult = {
  bpm: null,
  key: '',
  key_confidence: null,
  lufs: null,
  duration: null,
};

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(initialResult);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(initialResult);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(initialResult);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#393053] text-[#E5D1FA] flex flex-col items-center font-sans">
      <header className="w-full flex justify-between items-center px-8 py-4 bg-[#18122B]">
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-widest text-[#A3FFD6]">TAAL</span>
          <span className="text-xs tracking-widest text-[#E5D1FA]">AUDIO ANALYSIS</span>
          <span className="text-xs tracking-widest text-[#E5D1FA]">LOGIC</span>
        </div>
        <div className="flex gap-6 text-[#A3FFD6] text-sm">
          <button className="hover:underline">FAQ</button>
          <button className="hover:underline">ABOUT</button>
        </div>
      </header>
      <main className="flex flex-col items-center w-full flex-1 mt-8">
        <h1 className="text-4xl font-light tracking-widest text-[#A3FFD6] mb-2">AUDIO ANALYSIS</h1>
        <p className="text-[#5DEBD7] mb-8">ANALYZE BPM, KEY, AND MORE</p>
        <div
          className="w-[90vw] max-w-3xl h-56 bg-[#18122B] bg-opacity-80 border border-[#393053] rounded-xl flex flex-col justify-center items-center mb-10 cursor-pointer transition hover:border-[#A3FFD6]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="audio/mp3,audio/wav"
            className="hidden"
            onChange={handleFileChange}
          />
          <svg className="w-12 h-12 mb-2 text-[#5DEBD7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className="text-[#5DEBD7] font-semibold">DRAG FILE HERE</span>
          <span className="text-[#E5D1FA] text-sm mt-1">or click to browse</span>
          <span className="text-[#A3FFD6] text-xs mt-2">Supports MP3 and WAV files up to 25MB</span>
        </div>
        {file && (
          <button
            className="mb-8 px-6 py-2 rounded bg-[#5DEBD7] text-[#18122B] font-bold hover:bg-[#A3FFD6] transition"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        )}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <ResultCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
            label="BPM"
            value={result.bpm !== null ? result.bpm.toFixed(1) : '--'}
          />
          <ResultCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19V6l12-2v13" /><circle cx="6" cy="18" r="3" /></svg>}
            label={`KEY${result.key_confidence !== null ? ` (${(result.key_confidence * 100).toFixed(0)}% CONFIDENCE)` : ''}`}
            value={result.key || '--'}
          />
          <ResultCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>}
            label="DURATION"
            value={result.duration !== null ? formatDuration(result.duration) : '--'}
          />
          <ResultCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10v6a1 1 0 001 1h16a1 1 0 001-1v-6" /><path d="M8 21h8" /></svg>}
            label="INTEGRATED LOUDNESS"
            value={result.lufs !== null ? `${result.lufs.toFixed(1)} LUFS` : '--'}
          />
        </div>
      </main>
      <footer className="mt-auto mb-4 text-[#5DEBD7] text-xs">@AKAASH</footer>
    </div>
  );
}

function ResultCard({ icon, label, value }) {
  return (
    <div className="bg-[#18122B] bg-opacity-80 rounded-xl p-6 flex flex-col gap-2 border border-[#393053] min-h-[90px]">
      <div className="flex items-center gap-2 text-[#5DEBD7]">{icon}<span className="font-mono text-2xl">{value}</span></div>
      <div className="text-xs text-[#A3FFD6] mt-1">{label}</div>
    </div>
  );
}

function formatDuration(seconds) {
  if (isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
} 