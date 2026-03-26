/**
 * Audio player utilities — play/stop base64 WAV audio and record from mic.
 */

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play base64-encoded WAV audio. Returns the HTMLAudioElement.
 */
export function playBase64Audio(
  base64Audio: string,
  onEnded?: () => void,
): HTMLAudioElement {
  // Stop any currently playing audio first
  stopAudio();

  const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
  audio.addEventListener('ended', () => {
    currentAudio = null;
    onEnded?.();
  });
  audio.play().catch((err) => console.error('[Audio Play Error]', err));
  currentAudio = audio;
  return audio;
}

/**
 * Stop currently playing audio.
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Check if audio is currently playing.
 */
export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/**
 * Record audio from the user's microphone.
 * Returns a Promise that resolves to a Blob when recording stops.
 */
export function recordAudio(
  durationMs: number = 5000,
): Promise<{ blob: Blob; stop: () => void }> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        });
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        const stopRecording = () => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(chunks, { type: 'audio/webm' });
          resolve({ blob, stop: stopRecording });
        };

        mediaRecorder.onerror = () => {
          stream.getTracks().forEach((track) => track.stop());
          reject(new Error('Recording failed'));
        };

        mediaRecorder.start();

        // Auto-stop after duration
        setTimeout(stopRecording, durationMs);

        // Return early with stop function (via an outer resolve pattern)
        // We use a trick: resolve with stop fn so caller can stop early
        // Actually we need to resolve after stop with the blob.
        // So let the onstop handler resolve.
      })
      .catch(reject);
  });
}
