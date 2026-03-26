import type { FC } from 'react';

interface Props { isPlaying: boolean; onPlay: () => void; onStop: () => void; textResponse: string }

const VoiceControls: FC<Props> = ({ isPlaying, onPlay, onStop, textResponse }) => (
  <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-5">
    <h3 className="text-sm font-semibold text-white mb-3">🔊 Voice Summary</h3>
    <div className="flex gap-2 mb-3">
      <button onClick={onPlay} disabled={isPlaying}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm py-2 px-4 rounded-lg font-medium transition-colors">
        {isPlaying ? '🔊 Playing...' : '▶️ Play'}
      </button>
      {isPlaying && <button onClick={onStop} className="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-lg font-medium">⏹️ Stop</button>}
      {!isPlaying && <button onClick={onPlay} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-2 px-4 rounded-lg font-medium">🔁 Replay</button>}
    </div>
    {isPlaying && (
      <div className="flex gap-1 items-end h-6 mb-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 6}px`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )}
    <p className="text-sm text-slate-400 bg-slate-800/80 rounded-lg p-3 leading-relaxed">{textResponse}</p>
  </div>
);

export default VoiceControls;
