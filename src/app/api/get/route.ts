export const dynamic = "force-dynamic";

import { getAllMessages } from "@/utils/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const channelName = data.currentNote;

    if (!channelName) {
      return new NextResponse(
        JSON.stringify({ error: "Channel name is required" }),
        { status: 400 },
      );
    }

    const messages = await getAllMessages(channelName);

    return new NextResponse(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 },
    );
  }
}
