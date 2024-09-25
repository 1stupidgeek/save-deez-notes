import { deleteMessage, editMessage, sendMessage } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json();
    const { message, currentNote } = data;

    try {
        const response = await sendMessage(message, currentNote);
        return NextResponse.json({ message: "Message sent successfully", data: response }, { status: 200 });
    } catch (e) {
        console.error("Unable to send message - ", e);
        return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const data = await req.json();
    const message = data.message;

    try {
        await editMessage(message);
        return new NextResponse("Message edited successfully :)", { status: 200 });
    } catch (e) {
        console.error("Unable to edit message - ", e);
        return new NextResponse("Unable to edit message :(", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const data = await req.json();
    const { messageId, currentNote } = data;

    if (!messageId) {
        return new NextResponse("No message ID provided", { status: 400 });
    }

    try {
        await deleteMessage(messageId, currentNote);
        return new NextResponse("Message deleted successfully :)", { status: 200 });
    } catch (e) {
        console.error("Unable to delete message - ", e);
        return new NextResponse(`Unable to delete message: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 500 });
    }
}
