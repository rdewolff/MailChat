import { NextResponse } from "next/server";

import { listThreads } from "@/lib/server/repositories";

export async function GET() {
  const threads = await listThreads();
  return NextResponse.json({ threads });
}
