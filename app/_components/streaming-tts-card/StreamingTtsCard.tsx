"use client";

import { useRef, useState, useTransition } from "react";

import { DemoCard } from "../demo-card/DemoCard";

type StreamingTtsCardProps = {
  voiceId: string;
};

const STREAMING_STORY =
  "[calm storytelling] Maya found the old lighthouse just after sunrise, when the sea was still silver and the village was barely awake. [curious] Inside, every stair creaked like it remembered a secret. [whispering] At the top, she discovered a small brass radio humming on the windowsill, even though it had no batteries and no cord. [surprised] A voice crackled through the speaker and asked her to turn the lamp toward the horizon. [hopeful and amazed] When she did, a hidden path of light appeared across the water, pointing to an island nobody had seen in a hundred years.";

export function StreamingTtsCard({ voiceId }: StreamingTtsCardProps) {
  const [text, setText] = useState(STREAMING_STORY);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to stream");
  const [firstPlayableMs, setFirstPlayableMs] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  // useTransition gives the button an instant pending state while React swaps
  // the audio URL. isConnecting keeps that state visible until audio can play.
  const [isPending, startTransition] = useTransition();
  const startedAtRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isStartingStream = isPending || isConnecting;

  function streamSpeech() {
    if (!text.trim()) {
      setStatus("Add some text first");
      return;
    }

    // This transition keeps the click responsive while the audio element gets a
    // new streaming URL and begins loading it in the background.
    startTransition(() => {
      startedAtRef.current = now();
      setFirstPlayableMs(null);
      setIsConnecting(true);
      setStatus("Preparing stream...");

      // A normal <audio src> is the simplest way to get real progressive
      // playback in the browser. The route behind this URL uses convertRealtime.
      const params = new URLSearchParams({
        text: text.trim(),
        // Force a fresh request when the same text is streamed twice.
        t: String(Date.now()),
      });
      if (voiceId.trim()) params.set("reference_id", voiceId.trim());
      setAudioUrl(`/api/tts-stream?${params.toString()}`);
    });
  }

  function markFirstPlayable(statusText: string) {
    // The first canplay/playing event tells us the browser has enough streamed
    // MP3 data to begin playback.
    setIsConnecting(false);
    setFirstPlayableMs((current) =>
      current ?? (startedAtRef.current ? Math.round(now() - startedAtRef.current) : 0),
    );
    setStatus(statusText);
  }

  function finishStream(statusText: string) {
    setIsConnecting(false);
    setStatus(statusText);
  }

  return (
    <DemoCard title="5. Streaming TTS" status={status} className="streaming-card">
      <label htmlFor="stream-text">Text</label>
      <textarea
        id="stream-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button type="button" onClick={streamSpeech} disabled={isStartingStream}>
        {isStartingStream ? "Starting stream..." : "Stream audio"}
      </button>

      <div className="result-box">
        <p>Native audio streaming from /api/tts-stream</p>
        {isStartingStream && <span>Waiting for the first playable audio...</span>}
        {firstPlayableMs !== null && (
          <span>First playable audio in {firstPlayableMs} ms</span>
        )}
      </div>

      <audio
        ref={audioRef}
        controls
        autoPlay
        src={audioUrl ?? undefined}
        className="w-full"
        // Native audio events are our progress callbacks for the stream.
        onLoadStart={() => {
          setIsConnecting(true);
          setStatus("Connecting...");
        }}
        onCanPlay={() => markFirstPlayable("Ready to play")}
        onPlaying={() => markFirstPlayable("Playing stream")}
        onEnded={() => finishStream("Stream complete")}
        onError={() => finishStream("Streaming failed")}
      />
    </DemoCard>
  );
}

function now() {
  return performance.now();
}
