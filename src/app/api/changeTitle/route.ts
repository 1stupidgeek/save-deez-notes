export const dynamic = 'force-dynamic'

import { changeTitle } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const data = await req.json();
        const { channelName, newTitle } = data;

        if (!channelName || !newTitle) {
            return NextResponse.json({ error: "Both channelName and newTitle are required." }, { status: 400 });
        }

        await changeTitle(channelName, newTitle);
        
        return NextResponse.json({ message: "Title changed successfully" }, { status: 200 });
    } catch (e) {
        console.error("Unable to change title - ", e);
        return NextResponse.json({ error: "Unable to change title" }, { status: 500 });
    }
}
