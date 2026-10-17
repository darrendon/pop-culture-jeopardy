// Sound cues for the game. The audio files live in public/sounds/.
// Change the file names in SOUND_FILES to swap which sound plays when.
// Any file that's missing is simply skipped. Press "M" during a game to mute.

export type SoundName =
  | "single"
  | "double"
  | "final"
  | "daily_double"
  | "think";

const SOUND_FILES: Record<SoundName, string> = {
  single: "single.mp3", // Single Jeopardy starts
  double: "single.mp3", // Double Jeopardy starts
  final: "single.mp3", // Final Jeopardy category appears
  daily_double: "dailydouble.mp3", // a Daily Double is revealed
  think: "final.mp3", // Final Jeopardy think music
};

// Played by the host's "Time's up" button. If this file isn't in
// public/sounds/, a built-in three-tone buzzer plays instead.
const TIMES_UP_FILE = "timesup.mp3";

let current: HTMLAudioElement | null = null;
let muted = false;

export function soundUrl(name: SoundName): string {
  return `${process.env.PUBLIC_URL}/sounds/${SOUND_FILES[name]}`;
}

// Plays a sound, replacing whatever was playing. Returns false when muted.
// onEnded fires when the sound finishes on its own (not when stopped).
export function playSound(name: SoundName, onEnded?: () => void): boolean {
  stopSound();
  if (muted) return false;
  const audio = new Audio(soundUrl(name));
  current = audio;
  audio.onended = () => {
    if (current === audio) current = null;
    if (onEnded) onEnded();
  };
  // A missing file or a blocked autoplay just fails quietly.
  audio.play().catch(() => {
    if (current === audio) current = null;
    if (onEnded) onEnded();
  });
  return true;
}

// Time's up: plays on top of anything else without stopping it.
export function playTimesUp() {
  if (muted) return;
  const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${TIMES_UP_FILE}`);
  audio.play().catch(() => synthTimesUp());
}

let audioContext: AudioContext | null = null;

function synthTimesUp() {
  const AudioCtor =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return;
  if (audioContext === null) audioContext = new AudioCtor();
  const ctx = audioContext;
  const start = ctx.currentTime + 0.02;
  [784, 659, 523].forEach((frequency, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = start + i * 0.26;
    osc.type = "triangle";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    gain.gain.setValueAtTime(0.4, t + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  });
}

export function stopSound() {
  if (current !== null) {
    current.pause();
    current = null;
  }
}

export function toggleMute(): boolean {
  muted = !muted;
  if (muted) stopSound();
  return muted;
}

export function isMuted(): boolean {
  return muted;
}

// Media paths in a game file can be full URLs or paths inside public/,
// such as "media/album_cover.jpg".
export function mediaUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${process.env.PUBLIC_URL}/${path.replace(/^\/+/, "")}`;
}
