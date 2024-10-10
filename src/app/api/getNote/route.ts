export const dynamic = "force-dynamic";

import { getLatestMessage } from "@/utils/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const channelId = data.noteID;

    if (!channelId) {
      return new NextResponse(
        JSON.stringify({ error: "Channel name is required" }),
        { status: 400 },
      );
    }

    const message = await getLatestMessage(channelId);

    return new NextResponse(JSON.stringify(message), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 },
    );
  }
}
