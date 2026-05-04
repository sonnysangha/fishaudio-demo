"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { DemoCard } from "../demo-card/DemoCard";
import { readError } from "../utils/read-error";

type TextToSpeechCardProps = {
  voiceId: string;
  onVoiceIdChange: (voiceId: string) => void;
};

const EMOTION_TTS_EXAMPLE =
  "[cheerful and welcoming] Welcome to the Fish Audio demo. [curious] Try changing this text, or add your own emotion tags to guide the voice.";

export function TextToSpeechCard({
  voiceId,
  onVoiceIdChange,
}: TextToSpeechCardProps) {
  const [text, setText] = useState(EMOTION_TTS_EXAMPLE);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isPending, startTransition] = useTransition();
  const revokeRef = useRef<string | null>(null);

  useEffect(() => {
    // Object URLs keep audio in memory, so clean them up when this card unmounts.
    return () => {
      if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
    };
  }, []);

  async function generateSpeech() {
    if (!text.trim()) {
      setStatus("Add some text first");
      return;
    }

    setStatus("Generating...");
    // The browser calls our local route; the Fish API key stays on the server.
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        reference_id: voiceId.trim() || undefined,
      }),
    });

    if (!res.ok) {
      setStatus(await readError(res));
      return;
    }

    const blob = await res.blob();
    if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
    // Turn the returned MP3 bytes into something the audio tag can play.
    const nextUrl = URL.createObjectURL(blob);
    revokeRef.current = nextUrl;
    setAudioUrl(nextUrl);
    setStatus("Generated");
  }

  return (
    <DemoCard title="1. Text to Speech" status={status}>
      <label htmlFor="tts-text">Text</label>
      <textarea
        id="tts-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        // S2-Pro supports natural emotion descriptions in [brackets].
        placeholder={EMOTION_TTS_EXAMPLE}
      />

      <label htmlFor="voice-id">Voice ID</label>
      <input
        id="voice-id"
        value={voiceId}
        onChange={(e) => onVoiceIdChange(e.target.value)}
        placeholder="Optional Fish Audio voice model ID"
      />

      <button
        type="button"
        onClick={() => startTransition(generateSpeech)}
        disabled={isPending}
      >
        {isPending ? "Generating..." : "Generate audio"}
      </button>

      {audioUrl && <audio controls src={audioUrl} className="w-full" />}
    </DemoCard>
  );
}
