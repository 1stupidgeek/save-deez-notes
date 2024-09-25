import { createNewChannel, getAllMessages, getChannelByName } from "@/utils/bot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const data = await req.json();
    const channelName = data.channelName;

    if (!channelName) {
        return NextResponse.json({ error: "Channel name is required." }, { status: 400 });
    }

    const messages = await createNewChannel(channelName)

    if (!messages) {
        return new Response(JSON.stringify(false), { status: 200 });
    }
    else {
        return new Response(JSON.stringify(messages), { status: 200 })
    }
}
