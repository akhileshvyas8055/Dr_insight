import type { SmartSavingsRequest, SmartSavingsResponse } from '../types/smartSavings';

const API = 'https://dr-insights-backend.onrender.com/api/v1';

export async function fetchSmartSavings(req: SmartSavingsRequest): Promise<SmartSavingsResponse> {
  const res = await fetch(`${API}/smart-savings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export function playBase64Audio(b64: string): HTMLAudioElement {
  const audio = new Audio(`data:audio/wav;base64,${b64}`);
  audio.play();
  return audio;
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export function formatLakh(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return formatINR(n);
}
