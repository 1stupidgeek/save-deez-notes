export const dynamic = "force-dynamic";

import { changeTitle } from "@/utils/bot";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { id, title } = await req.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: "No ID or title given" },
        { status: 400 },
      );
    }

    const success = await changeTitle(id, title);

    if (success) {
      return new Response(null, { status: 202 });
    } else {
      return new Response(null, { status: 400 });
    }
  } catch (e) {
    console.error("Unable to change title - ", e);
    return NextResponse.json(
      { error: "Unable to change title" },
      { status: 500 },
    );
  }
}
