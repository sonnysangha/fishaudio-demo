import { errorMessage, getFishAudio } from "@/lib/fish-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // The client sends the selected audio file as multipart/form-data.
    const formData = await req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File) || audio.size === 0) {
      return jsonError("Choose an audio file.", 400);
    }

    // Route handlers are a clean fit for file uploads; Server Actions would add
    // extra serialization and body-size configuration for this demo.
    const result = await getFishAudio().speechToText.convert({
      audio,
      ignore_timestamps: false,
    });

    return Response.json({
      // Return the SDK result in the same tiny shape the card renders.
      text: result.text,
      duration: result.duration,
      segments: result.segments ?? [],
    });
  } catch (error) {
    return jsonError(errorMessage(error), 500);
  }
}

function jsonError(error: string, status: number) {
  // Keep upload validation errors predictable for the frontend.
  return Response.json({ error }, { status });
}
