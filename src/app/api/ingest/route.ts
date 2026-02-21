import { NextResponse } from "next/server";
import { z } from "zod";

import { ingestInboundMessage } from "@/lib/server/repositories";

const schema = z.object({
  threadId: z.string().min(1),
  fromAddress: z.string().email(),
  toAddresses: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  bodyText: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const message = await ingestInboundMessage(parsed.data);

  return NextResponse.json({ message }, { status: 201 });
}
