"use client";

import { useEffect, useState, useTransition } from "react";

import type { Voice } from "../demo-types";
import { DemoCard } from "../demo-card/DemoCard";
import { readError } from "../utils/read-error";
import { loadSavedClones, saveClone } from "./saved-clones";

type VoiceCloneCardProps = {
  onSelectVoice: (voice: Voice) => void;
};

export function VoiceCloneCard({ onSelectVoice }: VoiceCloneCardProps) {
  const [name, setName] = useState("Demo cloned voice");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Choose a reference clip");
  const [savedClones, setSavedClones] = useState<Voice[]>([]);
  const [usingVoiceId, setUsingVoiceId] = useState<string | null>(null);
  const [copyingVoiceId, setCopyingVoiceId] = useState<string | null>(null);
  const [isClonePending, startCloneTransition] = useTransition();
  const [isUseVoicePending, startUseVoiceTransition] = useTransition();
  const [isCopyPending, startCopyTransition] = useTransition();

  useEffect(() => {
    // Load local clone shortcuts after mount so the server render stays simple.
    const loadSaved = window.setTimeout(() => {
      setSavedClones(loadSavedClones());
    }, 0);

    return () => window.clearTimeout(loadSaved);
  }, []);

  async function createClone() {
    if (!name.trim()) {
      setStatus("Name the cloned voice");
      return;
    }
    if (!file) {
      setStatus("Choose a reference clip first");
      return;
    }

    setStatus("Creating voice...");
    // The SDK clone endpoint expects multipart form data with the audio file.
    const formData = new FormData();
    formData.set("title", name.trim());
    formData.set("voice", file);

    const res = await fetch("/api/voices/clone", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setStatus(await readError(res));
      return;
    }

    const created = (await res.json()) as Voice;
    // Save a local shortcut and immediately make the clone available to TTS.
    setSavedClones(saveClone(created));
    onSelectVoice(created);
    setStatus(`Created ${created.title}`);
  }

  function selectVoice(voice: Voice) {
    setUsingVoiceId(voice.id);
    startUseVoiceTransition(() => {
      onSelectVoice(voice);
      setUsingVoiceId(null);
    });
  }

  async function copyVoiceId(id: string) {
    try {
      // Helpful on video: copy the exact ID without selecting tiny text.
      await navigator.clipboard.writeText(id);
      setStatus("Copied voice ID");
    } catch {
      setStatus(`Copy this ID: ${id}`);
    }
  }

  function handleCopyVoiceId(id: string) {
    setCopyingVoiceId(id);
    startCopyTransition(async () => {
      await copyVoiceId(id);
      setCopyingVoiceId(null);
    });
  }

  return (
    <DemoCard title="5. Clone Voice" status={status}>
      <label htmlFor="clone-name">Voice name</label>
      <input
        id="clone-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="clone-file">Reference audio</label>
      <input
        id="clone-file"
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => startCloneTransition(createClone)}
        disabled={isClonePending}
      >
        {isClonePending ? "Creating..." : "Create voice"}
      </button>

      <div className="saved-section">
        <label>Saved cloned voices</label>
        {savedClones.length === 0 ? (
          <div className="empty-state">
            Created voices will appear here with their reusable voice IDs.
          </div>
        ) : (
          <div className="list">
            {savedClones.map((voice) => (
              <div className="list-row" key={voice.id}>
                <div>
                  <strong>{voice.title}</strong>
                  <code>{voice.id}</code>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    onClick={() => selectVoice(voice)}
                    disabled={isUseVoicePending && usingVoiceId === voice.id}
                  >
                    {isUseVoicePending && usingVoiceId === voice.id
                      ? "Using..."
                      : "Use"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyVoiceId(voice.id)}
                    disabled={isCopyPending && copyingVoiceId === voice.id}
                  >
                    {isCopyPending && copyingVoiceId === voice.id
                      ? "Copying..."
                      : "Copy ID"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DemoCard>
  );
}
