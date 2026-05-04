import { errorMessage, getFishAudio } from "@/lib/fish-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title")?.trim();
    // Searching without a title shows popular/task-count voices; typing a title
    // switches to score-based matching.
    const result = await getFishAudio().voices.search({
      title: title || undefined,
      page_size: 6,
      page_number: 1,
      sort_by: title ? "score" : "task_count",
    });

    return Response.json({
      total: result.total,
      // Flatten the SDK model entity into the tiny shape the card renders.
      // This makes the client-side code easier to teach on camera.
      items: result.items.map((voice) => ({
        id: voice._id,
        title: voice.title,
        description: voice.description,
      })),
    });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
