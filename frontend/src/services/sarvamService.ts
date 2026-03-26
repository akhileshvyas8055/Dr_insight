/**
 * Sarvam AI service — frontend API calls for voice features.
 */
import { api } from '../lib/api';

export interface VoiceResponse {
  text: string;
  english_text: string;
  audio: string | null;
  language: string;
  error?: string;
}

export interface TranscribeResponse {
  transcript: string;
  language: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'od-IN', label: 'Odia' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

/**
 * Request TTS for comparison results.
 */
export async function speakComparison(
  city: string,
  procedure: string,
  language: LanguageCode,
  speaker: string = 'anushka',
): Promise<VoiceResponse> {
  const { data } = await api.post('/voice/speak-comparison', {
    city,
    procedure,
    language,
    speaker,
  });
  return data;
}

/**
 * Request TTS for fair-price check results.
 */
export async function speakFairPrice(
  city: string,
  procedure: string,
  quote: number,
  language: LanguageCode,
  speaker: string = 'anushka',
): Promise<VoiceResponse> {
  const { data } = await api.post('/voice/speak-fair-price', {
    city,
    procedure,
    quote,
    language,
    speaker,
  });
  return data;
}

/**
 * Transcribe audio using Sarvam STT.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: LanguageCode,
): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('language', language);
  const { data } = await api.post('/voice/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
