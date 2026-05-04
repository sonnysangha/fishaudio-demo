import { errorMessage, getFishAudio } from "@/lib/fish-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // This route receives the clone name and reference clip from the browser.
    const formData = await req.formData();
    const title = formData.get("title");
    const voice = formData.get("voice");

    if (typeof title !== "string" || !title.trim()) {
      return jsonError("Voice name is required.", 400);
    }
    if (!(voice instanceof File) || voice.size === 0) {
      return jsonError("Choose a reference audio file.", 400);
    }

    // Create a private reusable voice model from one reference clip. The
    // returned ID is what the TTS card can use as `reference_id`.
    const created = await getFishAudio().voices.ivc.create({
      title: title.trim(),
      voices: [voice],
      visibility: "private",
      train_mode: "fast",
      enhance_audio_quality: true,
    });

    return Response.json({
      // Only send back what the UI needs to save and reuse the clone.
      id: created._id,
      title: created.title,
      description: created.description,
    });
  } catch (error) {
    return jsonError(errorMessage(error), 500);
  }
}

function jsonError(error: string, status: number) {
  // Same simple shape as the other demo routes.
  return Response.json({ error }, { status });
}
