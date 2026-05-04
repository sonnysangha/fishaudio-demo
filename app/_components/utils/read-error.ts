export async function readError(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  try {
    // All demo routes return { error } on failure, so cards can share this.
    const body = (await res.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}
