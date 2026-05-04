"use client";

import { useState, useTransition } from "react";

import type { Voice } from "../demo-types";
import { DemoCard } from "../demo-card/DemoCard";
import { readError } from "../utils/read-error";

type VoiceSearchCardProps = {
  onSelectVoice: (voice: Voice) => void;
};

export function VoiceSearchCard({ onSelectVoice }: VoiceSearchCardProps) {
  const [query, setQuery] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [status, setStatus] = useState("Search for a voice");
  const [usingVoiceId, setUsingVoiceId] = useState<string | null>(null);
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isUseVoicePending, startUseVoiceTransition] = useTransition();

  async function searchVoices() {
    setStatus("Searching...");
    // Keep the query string tiny and readable for the video walkthrough.
    const params = new URLSearchParams();
    if (query.trim()) params.set("title", query.trim());

    const res = await fetch(`/api/voices?${params.toString()}`);
    if (!res.ok) {
      setStatus(await readError(res));
      setVoices([]);
      return;
    }

    const data = (await res.json()) as { items: Voice[] };
    // Results are flattened to just the fields this demo needs.
    setVoices(data.items);
    setStatus(`${data.items.length} voices`);
  }

  function selectVoice(voice: Voice) {
    setUsingVoiceId(voice.id);
    startUseVoiceTransition(() => {
      // Selecting a voice only updates the shared TTS voice ID.
      onSelectVoice(voice);
      setUsingVoiceId(null);
    });
  }

  return (
    <DemoCard title="4. Search Voices" status={status}>
      <label htmlFor="voice-search">Search term</label>
      <input
        id="voice-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Narrator, warm, podcast..."
      />

      <button
        type="button"
        onClick={() => startSearchTransition(searchVoices)}
        disabled={isSearchPending}
      >
        {isSearchPending ? "Searching..." : "Search voices"}
      </button>

      <div className="list">
        {voices.map((voice) => (
          <div className="list-row" key={voice.id}>
            <div>
              <strong>{voice.title}</strong>
              <code>{voice.id}</code>
            </div>
            <button
              type="button"
              onClick={() => selectVoice(voice)}
              disabled={isUseVoicePending && usingVoiceId === voice.id}
            >
              {isUseVoicePending && usingVoiceId === voice.id ? "Using..." : "Use"}
            </button>
          </div>
        ))}
      </div>
    </DemoCard>
  );
}
