export const dynamic = "force-dynamic";

import { sendMessage } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const { noteId, message } = data;

  try {
    const response = await sendMessage(noteId, message);
    return NextResponse.json(
      { message: "Message sent successfully", data: response },
      { status: 200 },
    );
  } catch (e) {
    console.error("Unable to send message - ", e);
    return NextResponse.json(
      { error: "Unable to send message" },
      { status: 500 },
    );
  }
}
