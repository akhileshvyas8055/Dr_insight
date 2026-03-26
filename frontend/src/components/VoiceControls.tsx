/**
 * VoiceControls — Play/Replay/Mic buttons with loading state and speaker animation.
 * Matches existing emerald-on-dark theme.
 */
import { useState, useRef, useCallback } from 'react';
import { playBase64Audio, stopAudio } from '../utils/audioPlayer';
import { transcribeAudio, type LanguageCode } from '../services/sarvamService';

interface Props {
  /** Call this to trigger TTS — should call the speak API and return the response */
  onSpeak: () => Promise<{ audio: string | null; text: string } | null>;
  /** Called when transcript is received from STT */
  onTranscript?: (transcript: string) => void;
  language: LanguageCode;
  disabled?: boolean;
}

export default function VoiceControls({ onSpeak, onTranscript, language, disabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastAudio, setLastAudio] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handlePlay = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await onSpeak();
      if (result?.audio) {
        setLastAudio(result.audio);
        setSpokenText(result.text || '');
        setIsPlaying(true);
        playBase64Audio(result.audio, () => setIsPlaying(false));
      }
    } catch (err) {
      console.error('[Voice Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, [onSpeak, isLoading]);

  const handleReplay = useCallback(() => {
    if (!lastAudio) return;
    setIsPlaying(true);
    playBase64Audio(lastAudio, () => setIsPlaying(false));
  }, [lastAudio]);

  const handleStop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
  }, []);

  const handleMicStart = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (onTranscript) {
          setIsLoading(true);
          try {
            const result = await transcribeAudio(blob, language);
            if (result.transcript) {
              onTranscript(result.transcript);
            }
          } catch (err) {
            console.error('[STT Error]', err);
          } finally {
            setIsLoading(false);
          }
        }
      };

      mediaRecorder.start();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 10000);
    } catch (err) {
      console.error('[Mic Error]', err);
      setIsRecording(false);
    }
  }, [isRecording, language, onTranscript]);

  return (
    <div className="flex flex-col gap-3">
      {/* Controls Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play / Loading Button */}
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={disabled || isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-300 transform
            ${isLoading
              ? 'bg-slate-700 text-slate-400 cursor-wait'
              : isPlaying
                ? 'bg-red-500/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/20'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating voice…
            </>
          ) : isPlaying ? (
            <>
              {/* Animated speaker bars */}
              <div className="flex items-end gap-0.5 h-4">
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '80%', animationDelay: '100ms' }} />
              </div>
              Stop
            </>
          ) : (
            <>🔊 Play Response</>
          )}
        </button>

        {/* Replay Button */}
        {lastAudio && !isPlaying && (
          <button
            onClick={handleReplay}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
                       bg-slate-800 text-slate-200 border border-slate-700
                       hover:bg-slate-700 hover:border-slate-600 transition-all duration-200
                       disabled:opacity-50"
          >
            🔁 Replay
          </button>
        )}

        {/* Mic Button */}
        {onTranscript && (
          <button
            onClick={handleMicStart}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isRecording
                ? 'bg-red-500/90 text-white animate-pulse shadow-lg shadow-red-500/20'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
              }
              disabled:opacity-50
            `}
          >
            🎤 {isRecording ? 'Recording… (tap to stop)' : 'Ask by Voice'}
          </button>
        )}
      </div>

      {/* Spoken Text Display (collapsible) */}
      {spokenText && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-400 leading-relaxed max-h-20 overflow-y-auto">
          <span className="text-slate-500 font-medium">🗣️ </span>
          {spokenText}
        </div>
      )}
    </div>
  );
}
