/**
 * Voice Guide & Audio Feedback Utility for Accessible & Illiterate-Friendly Experience
 */

let isVoiceEnabled = true;

export const setVoiceEnabled = (enabled: boolean) => {
  isVoiceEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
};

export const getVoiceEnabled = () => isVoiceEnabled;

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const playAudioBeep = (type: 'success' | 'alert' | 'pickup' | 'click') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      // Pleasant rising major chord
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      // Warning double tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'pickup') {
      // Mechanical pleasant motor sweep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Light click
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // AudioContext blocked or not allowed until user interaction
  }
};

export const speak = (text: string, force: boolean = false) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!isVoiceEnabled && !force) return;

  try {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const cleanText = text
      .replace(/[🚨⚠️♻️🗑️🛋️🔒🦨✨🚛💨⚡]/g, '')
      .replace(/BIN-\d+/g, (m) => `Bin ${m.replace('BIN-', '')}`)
      .replace(/TRUCK-\d+/g, (m) => `Truck ${m.replace('TRUCK-', '')}`)
      .replace(/ppm/gi, 'parts per million')
      .replace(/kWh/gi, 'kilowatt hours');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
};
