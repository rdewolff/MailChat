import { env } from "@/lib/env";

export async function transcribeWithWhisperit(blob: Blob): Promise<string | null> {
  if (!env.WHISPERIT_API_URL || !env.WHISPERIT_API_KEY) {
    return null;
  }

  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  const response = await fetch(env.WHISPERIT_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHISPERIT_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisperit request failed (${response.status})`);
  }

  const payload = (await response.json()) as { text?: string; transcript?: string };

  return payload.text ?? payload.transcript ?? null;
}
