export const dynamic = "force-dynamic";

import { changeTitle } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, title } = data;

    if (!title) {
      return NextResponse.json(
        { error: "Bad request, ID or title is missing" },
        { status: 400 },
      );
    }

    await changeTitle(id, title);

    return NextResponse.json(
      { message: "Title changed successfully" },
      { status: 200 },
    );
  } catch (e) {
    console.error("Unable to change title - ", e);
    return NextResponse.json(
      { error: "Unable to change title" },
      { status: 500 },
    );
  }
}
