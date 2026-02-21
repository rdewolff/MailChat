import { NextResponse } from "next/server";

import { transcribeWithWhisperit } from "@/lib/voice/whisperit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("file");

  if (!(audioFile instanceof Blob)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  const transcript = await transcribeWithWhisperit(audioFile);

  if (!transcript) {
    return NextResponse.json(
      {
        transcript: "",
        message: "No Whisperit credentials found. Falling back to browser speech recognition.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ transcript }, { status: 200 });
}
