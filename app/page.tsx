"use client";

import { useState } from "react";

import { SpeechToTextCard } from "./_components/speech-to-text-card/SpeechToTextCard";
import { StreamingTtsCard } from "./_components/streaming-tts-card/StreamingTtsCard";
import { TextToSpeechCard } from "./_components/text-to-speech-card/TextToSpeechCard";
import { VoiceCloneCard } from "./_components/voice-clone-card/VoiceCloneCard";
import { VoiceSearchCard } from "./_components/voice-search-card/VoiceSearchCard";
import type { Voice } from "./_components/demo-types";

const STARTER_VOICE_ID = "802e3bc2b27e49c2995d23ef70e6ac89";

export default function Home() {
  // Shared by search/clone cards so any picked voice can drive TTS immediately.
  const [voiceId, setVoiceId] = useState(STARTER_VOICE_ID);

  function selectVoice(voice: Voice) {
    setVoiceId(voice.id);
  }

  return (
    <main className="mx-auto flex w-full flex-col max-w-7xl gap-8 py-8 sm:px-6">
      <header className="space-y-3">
        <p className="eyebrow">Fish Audio JavaScript SDK</p>
        <h1>Let&apos;s Clone a Voice Demo</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">
          Five small examples that mirror the SDK docs. The API key stays on the
          Next.js server, and the browser only talks to local route handlers.
        </p>
      </header>

      <section className="demo-grid">
        <TextToSpeechCard voiceId={voiceId} onVoiceIdChange={setVoiceId} />
        <SpeechToTextCard />
        <VoiceSearchCard onSelectVoice={selectVoice} />
        <VoiceCloneCard onSelectVoice={selectVoice} />
        <StreamingTtsCard voiceId={voiceId} />
      </section>
    </main>
  );
}
