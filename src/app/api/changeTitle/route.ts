import { changeTitle } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    const data = await req.json();
    const {channelName, newTitle} = data;
    try {
        await changeTitle(channelName, newTitle);
        return NextResponse.json({ message: "Title changed successfully"}, { status: 200 });
    } catch (e) {
        console.error("Unable to send message - ", e);
        return NextResponse.json({ error: "Unable to change title" }, { status: 500 });
    }
}
