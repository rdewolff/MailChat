import { NextResponse } from "next/server";

import { listThreadMessages } from "@/lib/server/repositories";

interface RouteContext {
  params: Promise<{ threadId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { threadId } = await context.params;
  const messages = await listThreadMessages(threadId);

  return NextResponse.json({ messages });
}
