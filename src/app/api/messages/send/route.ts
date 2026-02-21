import { NextResponse } from "next/server";
import { z } from "zod";

import { sendThreadMessage } from "@/lib/server/repositories";

const schema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(10000),
  optimizeTone: z.enum(["neutral", "friendly", "direct", "executive"]).optional(),
});

export async function POST(request: Request) {
  const payload = schema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload", details: payload.error.flatten() }, { status: 400 });
  }

  const message = await sendThreadMessage(payload.data);

  return NextResponse.json({ message });
}
