export const dynamic = "force-dynamic";

import { deleteChannel } from "@/utils/bot";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const id = data.id;

    if (!id) {
      return NextResponse.json(
        { error: "Channel name is required." },
        { status: 400 },
      );
    }

    const messages = await deleteChannel(id);

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/deleteChannel:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
