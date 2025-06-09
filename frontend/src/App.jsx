import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, User, Headphones } from 'lucide-react';

const initialResult = {
  bpm: null,
  key: '',
  key_confidence: null,
  lufs: null,
  duration: null,
};

function getHistory() {
  return JSON.parse(localStorage.getItem('analysisHistory') || '[]');
}

function saveHistory(history) {
  localStorage.setItem('analysisHistory', JSON.stringify(history));
}

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [history, setHistory] = useState(getHistory());
  const [analyzed, setAnalyzed] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(initialResult);
    setError('');
    setAnalyzed(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(initialResult);
      setError('');
      setAnalyzed(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(initialResult);
    setAnalyzed(false);
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
      setHistory([{ ...data, date: new Date().toISOString() }, ...history].slice(0, 10));
      setAnalyzed(true);
    } catch (err) {
      setError('Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Audio icon for header (headphones)
  const AudioIcon = (
    <Headphones size={32} strokeWidth={2.2} className="mr-2 text-[#A3FFD6]" />
  );

  // Audio loader (animated bars)
  const AudioLoader = (
    <div className="flex items-end gap-1 h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 rounded bg-[#5DEBD7] animate-audio-bar`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  // Upload box classes
  const uploadBoxBase =
    'w-full max-w-2xl h-56 sm:h-44 relative rounded-2xl flex flex-col justify-center items-center mb-6 cursor-pointer transition shadow-2xl backdrop-blur-lg border-2';
  const uploadBoxPulse =
    'animate-pulse-border';
  const uploadBoxGrid =
    'bg-[#120c1c] bg-opacity-90 border-[#28203a]';
  const uploadBoxActive =
    'border-[#5DEBD7]';
  const uploadBoxInactive =
    'border-[#28203a]';
  const uploadBoxFileSelected =
    'border-green-400';
  const uploadBoxDrag =
    'border-[#A3FFD6] bg-[#18122B] bg-opacity-90';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070512] to-[#18122B] text-[#E5D1FA] flex flex-col items-center font-sans overflow-hidden">
      <header className="w-full flex justify-between items-center px-4 py-2 bg-[#120c1c] bg-opacity-95 backdrop-blur-md shadow-lg">
        <div className="flex flex-row items-center">
          {AudioIcon}
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-widest text-[#A3FFD6] font-mono leading-none">TAAL</span>
            <span className="text-sm tracking-widest text-[#E5D1FA] font-mono leading-none">AUDIO ANALYSIS</span>
            <span className="text-xs tracking-widest text-[#E5D1FA] font-mono leading-none">LOGIC</span>
          </div>
        </div>
        <div className="flex gap-4 text-[#A3FFD6] text-sm items-center">
          <button aria-label="Show history" title="History" onClick={() => setShowHistory(true)} className="hover:text-[#5DEBD7] focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] rounded">{<Clock size={28} strokeWidth={2.2} className="..." />}</button>
          <button aria-label="Show FAQ" title="FAQ" onClick={() => setShowFAQ(true)} className="hover:text-[#5DEBD7] focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] rounded">{<HelpCircle size={28} strokeWidth={2.2} className="..." />}</button>
          <button aria-label="Show About" title="About" onClick={() => setShowAbout(true)} className="hover:text-[#5DEBD7] focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] rounded">{<User size={28} strokeWidth={2.2} className="..." />}</button>
        </div>
      </header>
      <main className="flex flex-col items-center w-full flex-1 justify-center max-h-[calc(100vh-100px)]">
        <h1 className="text-5xl sm:text-3xl font-extrabold tracking-widest text-[#A3FFD6] mb-3 font-mono drop-shadow-lg">AUDIO ANALYSIS</h1>
        <p className="text-[#5DEBD7] mb-6 text-xl sm:text-base font-semibold tracking-wide font-mono">ANALYZE BPM, KEY, AND MORE</p>
        <div
          className={[
            uploadBoxBase,
            uploadBoxPulse,
            uploadBoxGrid,
            file ? uploadBoxFileSelected : uploadBoxInactive,
            dragActive ? uploadBoxDrag : '',
          ].join(' ')}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
          tabIndex={0}
          aria-label="Upload audio file"
          role="button"
        >
          {/* SVG fine grid pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:1}}>
            <defs>
              <pattern id="smallGrid" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#28203a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
          {/* Sweeping horizontal light animation */}
          <div className="absolute inset-0 pointer-events-none" style={{zIndex:2}}>
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute left-0 top-0 w-full h-full animate-sweep-horizontal bg-gradient-to-r from-transparent via-[#A3FFD6]/30 to-transparent" style={{filter:'blur(8px)'}}></div>
            </div>
          </div>
          <input
            id="file-input"
            type="file"
            accept="audio/mp3,audio/wav"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Select audio file"
          />
          <svg className="w-16 h-16 mb-2 text-[#5DEBD7] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className="text-[#5DEBD7] font-extrabold text-2xl sm:text-lg relative z-10 font-mono tracking-widest">
            {file ? file.name.toUpperCase() : 'DRAG FILE HERE'}
          </span>
          <span className="text-[#E5D1FA] text-lg sm:text-xs mt-1 relative z-10 font-mono font-semibold">{file ? '' : 'or click to browse'}</span>
          <span className="text-[#A3FFD6] text-xs sm:text-[10px] mt-2 relative z-10 font-mono">Supports MP3 and WAV files up to 25MB</span>
        </div>
        {file && !loading && (
          <button
            className="mb-4 px-8 py-3 rounded-xl bg-gradient-to-br from-[#23203a] to-[#18122B] text-[#A3FFD6] font-extrabold text-lg font-mono tracking-widest shadow-lg backdrop-blur border border-[#5DEBD7] hover:from-[#28203a] hover:to-[#23203a] hover:border-[#A3FFD6] transition focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] glassy-btn"
            onClick={handleAnalyze}
            disabled={loading}
            aria-label="Analyze audio file"
            style={{backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)'}}>
            Analyze
          </button>
        )}
        {loading && (
          <div className="mb-4 flex justify-center items-center h-10">{AudioLoader}</div>
        )}
        {error && <div className="text-red-400 mb-2 text-xs sm:text-[10px] font-mono">{error}</div>}
        {analyzed && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-2xl mt-2">
            <ResultCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
              label="BPM"
              value={result.bpm !== null ? result.bpm.toFixed(1) : '--'}
            />
            <ResultCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19V6l12-2v13" /><circle cx="6" cy="18" r="3" /></svg>}
              label={`KEY${result.key_confidence !== null ? ` (${(result.key_confidence * 100).toFixed(0)}% CONFIDENCE)` : ''}`}
              value={result.key || '--'}
            />
            <ResultCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>}
              label="DURATION"
              value={result.duration !== null ? formatDuration(result.duration) : '--'}
            />
            <ResultCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10v6a1 1 0 001 1h16a1 1 0 001-1v-6" /><path d="M8 21h8" /></svg>}
              label="INTEGRATED LOUDNESS"
              value={result.lufs !== null ? `${result.lufs.toFixed(1)} LUFS` : '--'}
            />
          </div>
        )}
      </main>
      <footer className="mt-auto mb-2 text-[#5DEBD7] text-xs">
        <a href="https://x.com/AKAA5H" target="_blank" rel="noopener noreferrer" className="hover:underline focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] rounded">@AKAA5H</a>
      </footer>

      {/* History Modal */}
      {showHistory && (
        <Modal onClose={() => setShowHistory(false)}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#A3FFD6]">History</h2>
            <span onClick={clearHistory}>{<Clock size={28} strokeWidth={2.2} className="..." />}</span>
          </div>
          {history.length === 0 ? (
            <div className="text-[#E5D1FA]">No history yet.</div>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <li key={i} className="rounded-lg p-4 bg-[#18122B] bg-opacity-70 border border-[#393053] shadow-md flex flex-col gap-1">
                  <div className="flex gap-4 text-[#5DEBD7]">
                    <span>BPM: <b>{h.bpm?.toFixed(1)}</b></span>
                    <span>Key: <b>{h.key}</b></span>
                    <span>LUFS: <b>{h.lufs?.toFixed(1)}</b></span>
                    <span>Duration: <b>{formatDuration(h.duration)}</b></span>
                  </div>
                  <div className="text-xs text-[#A3FFD6]">{new Date(h.date).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
      {/* FAQ Modal */}
      {showFAQ && (
        <Modal onClose={() => setShowFAQ(false)}>
          <h2 className="text-xl font-bold text-[#A3FFD6] mb-2">FAQ</h2>
          <div className="text-[#E5D1FA]">Coming Soon</div>
        </Modal>
      )}
      {/* About Modal */}
      {showAbout && (
        <Modal onClose={() => setShowAbout(false)}>
          <h2 className="text-xl font-bold text-[#A3FFD6] mb-2">About</h2>
          <div className="text-[#E5D1FA]">Coming Soon</div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative bg-[#18122B] bg-opacity-90 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto border border-[#393053]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#A3FFD6] hover:text-[#5DEBD7] text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5DEBD7] rounded"
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value }) {
  return (
    <div className="bg-[#18122B] bg-opacity-70 rounded-xl p-4 flex flex-col gap-2 border border-[#393053] min-h-[70px] shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[#5DEBD7]">{icon}<span className="font-mono text-lg">{value}</span></div>
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