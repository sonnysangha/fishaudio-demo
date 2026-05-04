import "server-only";

import { FishAudioClient, FishAudioError, type Backends } from "fish-audio";

// Keep this file as the only place that knows about the Fish SDK.
// Components call our /api routes, and the routes call this helper.
//
// The installed SDK types are a little behind the current docs and do not list
// "s2-pro" yet, but Fish's docs use S2-Pro for the new TTS model. The cast keeps
// the demo code docs-aligned without spreading type workarounds across routes.
export const FISH_BACKEND = "s2-pro" as Backends;

let client: FishAudioClient | null = null;

export function getFishAudio() {
  // Read the key only when a request actually hits an API route.
  // This keeps `next build` working even before .env.local is configured.
  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) {
    throw new Error("FISH_API_KEY is not set in .env.local.");
  }

  // Reuse one SDK client per server process instead of creating one per button
  // click. The API key still never leaves this server-only module.
  client ??= new FishAudioClient({ apiKey });
  return client;
}

export function errorMessage(error: unknown) {
  // FishAudioError includes useful SDK/server details; normalize it so every
  // route can return the same simple `{ error }` shape to the frontend.
  if (error instanceof FishAudioError) {
    return error.message || `Fish Audio request failed (${error.statusCode})`;
  }
  if (error instanceof Error) return error.message;
  return "Fish Audio request failed.";
}
