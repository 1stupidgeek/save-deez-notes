export const dynamic = 'force-dynamic'

import { createNewChannel } from "@/utils/bot";
import { createRateLimiter } from "@/utils/limiter";
import { NextRequest, NextResponse } from "next/server";

const rateLimiter = createRateLimiter({
  maxRequests: 1,
  windowMs: 60 * 10000
})

export async function POST(req: NextRequest) {
  const isAllowed = rateLimiter(req);

  if (!isAllowed) {
    return new Response("Too many requests from the same IP!", { status: 429 })
  }
  else {
    try {
      const data = await req.json();
      const channelName = data.channelName;

      if (!channelName) {
        return NextResponse.json({ error: "Channel name is required." }, { status: 400 });
      }

      const messages = await createNewChannel(channelName);

      if (!messages) {
        return NextResponse.json({ success: false, message: "No messages found." }, { status: 200 });
      }

      return NextResponse.json({ success: true, messages }, { status: 200 });

    } catch (error) {
      console.error("Error in POST /api/createNewChannel:", error);
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  }
}

