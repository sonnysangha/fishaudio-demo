"use client";

import { useState, useTransition } from "react";

import type { SttResult } from "../demo-types";
import { DemoCard } from "../demo-card/DemoCard";
import { readError } from "../utils/read-error";

export function SpeechToTextCard() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SttResult | null>(null);
  const [status, setStatus] = useState("Choose an audio file");
  const [isPending, startTransition] = useTransition();

  async function transcribeAudio() {
    if (!file) {
      setStatus("Choose an audio file first");
      return;
    }

    setStatus("Transcribing...");
    // File uploads use FormData so the route can forward the audio to Fish.
    const formData = new FormData();
    formData.set("audio", file);

    const res = await fetch("/api/stt", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setStatus(await readError(res));
      setResult(null);
      return;
    }

    setResult((await res.json()) as SttResult);
    setStatus("Transcribed");
  }

  return (
    <DemoCard title="3. Speech to Text" status={status}>
      <label htmlFor="stt-file">Audio file</label>
      <input
        id="stt-file"
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => startTransition(transcribeAudio)}
        disabled={isPending}
      >
        {isPending ? "Transcribing..." : "Transcribe"}
      </button>

      {result && (
        <div className="result-box">
          <p>{result.text}</p>
          {typeof result.duration === "number" && (
            <span>{result.duration.toFixed(2)} seconds</span>
          )}
        </div>
      )}
    </DemoCard>
  );
}
