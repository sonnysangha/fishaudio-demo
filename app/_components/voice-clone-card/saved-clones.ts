import type { Voice } from "../demo-types";

const SAVED_CLONES_KEY = "fish-audio-demo:saved-cloned-voices";

// Store only local shortcuts; the real voice model lives in Fish Audio.
export function loadSavedClones(): Voice[] {
  try {
    const raw = window.localStorage.getItem(SAVED_CLONES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Voice[];
    return parsed.filter(
      (voice) => typeof voice.id === "string" && typeof voice.title === "string",
    );
  } catch {
    return [];
  }
}

export function saveClone(voice: Voice): Voice[] {
  // Put the newest clone first and avoid duplicate rows for the same model ID.
  const next = [
    voice,
    ...loadSavedClones().filter((saved) => saved.id !== voice.id),
  ].slice(0, 8);
  window.localStorage.setItem(SAVED_CLONES_KEY, JSON.stringify(next));
  return next;
}
