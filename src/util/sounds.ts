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

let current: HTMLAudioElement | null = null;
let muted = false;

export function soundUrl(name: SoundName): string {
  return `${process.env.PUBLIC_URL}/sounds/${SOUND_FILES[name]}`;
}

export function playSound(name: SoundName) {
  stopSound();
  if (muted) return;
  const audio = new Audio(soundUrl(name));
  current = audio;
  // A missing file or a blocked autoplay just fails quietly.
  audio.play().catch(() => {});
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
