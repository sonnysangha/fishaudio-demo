import { FISH_BACKEND, errorMessage, getFishAudio } from "@/lib/fish-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The browser sends only safe inputs here. The server adds auth through the SDK.
type TtsBody = {
  text?: string;
  reference_id?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TtsBody;
    const text = body.text?.trim();
    if (!text) return jsonError("Text is required.", 400);

    // convert() returns a ReadableStream of audio bytes. We pass that stream
    // straight back to the browser so the client can create an <audio> URL.
    const audio = await getFishAudio().textToSpeech.convert(
      {
        text,
        reference_id: body.reference_id?.trim() || undefined,
        format: "mp3",
      },
      FISH_BACKEND,
      { timeoutInSeconds: 120 },
    );

    return new Response(audio, {
      headers: {
        // Tell the browser this response is playable MP3, not JSON.
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(errorMessage(error), 500);
  }
}

function jsonError(error: string, status: number) {
  // Match the small error contract used by the client-side readError helper.
  return Response.json({ error }, { status });
}
