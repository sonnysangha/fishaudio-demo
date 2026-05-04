import { RealtimeEvents, type RealtimeConnection } from "fish-audio";

import { FISH_BACKEND, errorMessage, getFishAudio } from "@/lib/fish-client";

// Realtime TTS uses the SDK's Node WebSocket client, so this route must run in
// the Node runtime instead of the Edge runtime.
export const runtime = "nodejs";

// Streaming responses should be created fresh for every button click.
export const dynamic = "force-dynamic";

type StreamBody = {
  text?: string;
  reference_id?: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const text = url.searchParams.get("text")?.trim();
    if (!text) return jsonError("Text is required.", 400);

    // The audio element needs a GET URL for native progressive playback.
    return streamAudioResponse(
      text,
      url.searchParams.get("reference_id")?.trim() || undefined,
    );
  } catch (error) {
    return jsonError(errorMessage(error), 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StreamBody;
    const text = body.text?.trim();
    if (!text) return jsonError("Text is required.", 400);

    // Keep POST too, so this example can still be tested like a normal API.
    return streamAudioResponse(
      text,
      body.reference_id?.trim() || undefined,
    );
  } catch (error) {
    return jsonError(errorMessage(error), 500);
  }
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

function streamAudioResponse(text: string, referenceId?: string) {
  // The SDK's realtime method sends text over WebSocket and emits audio chunks.
  // This Response turns those events into a regular streaming MP3 response.
  const audio = createRealtimeAudioStream(text, referenceId);

  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      // Helpful when deploying behind proxies that might otherwise buffer.
      "X-Accel-Buffering": "no",
    },
  });
}

function createRealtimeAudioStream(text: string, referenceId?: string) {
  let connection: RealtimeConnection | null = null;
  let finished = false;
  let cleanup = () => {};

  // ReadableStream is the bridge between Fish Audio's WebSocket events and the
  // browser's plain fetch response body.
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function closeStream() {
        if (finished) return;
        finished = true;
        cleanup();
        controller.close();
      }

      function failStream(error: unknown) {
        if (finished) return;
        finished = true;
        cleanup();
        controller.error(error);
      }

      function handleAudio(audio: unknown) {
        if (finished) return;
        // Each AUDIO_CHUNK event is already encoded MP3 data; enqueue it
        // immediately so the client can play before the full response exists.
        if (audio instanceof Uint8Array) {
          controller.enqueue(audio);
        } else if (Buffer.isBuffer(audio)) {
          controller.enqueue(new Uint8Array(audio));
        }
      }

      try {
        connection = await getFishAudio().textToSpeech.convertRealtime(
          {
            text: "",
            reference_id: referenceId,
            format: "mp3",
          },
          textStream(text),
          FISH_BACKEND,
        );

        // Keep named handlers so cancel/error paths can unsubscribe cleanly.
        const handleError = (error: unknown) => failStream(error);
        const handleClose = () => closeStream();

        cleanup = () => {
          connection?.off(RealtimeEvents.AUDIO_CHUNK, handleAudio);
          connection?.off(RealtimeEvents.ERROR, handleError);
          connection?.off(RealtimeEvents.CLOSE, handleClose);
        };

        connection.on(RealtimeEvents.AUDIO_CHUNK, handleAudio);
        connection.on(RealtimeEvents.ERROR, handleError);
        connection.on(RealtimeEvents.CLOSE, handleClose);
      } catch (error) {
        failStream(error);
      }
    },
    cancel() {
      // If the user starts another stream or leaves the page, stop billing/work
      // on the upstream realtime connection too.
      finished = true;
      cleanup();
      connection?.close();
    },
  });
}

async function* textStream(text: string) {
  // Match the docs: the request starts with `text: ""`, then text arrives in
  // smaller pieces over the realtime connection.
  for (const chunk of text.match(/[^.!?]+[.!?]?\s*/g) ?? [text]) {
    if (chunk.trim()) yield chunk;
  }
}
