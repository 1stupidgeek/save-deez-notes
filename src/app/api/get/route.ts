import { getAllMessages } from "@/utils/bot";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    
    const data = await req.json();
    const channelName = data.currentNote;
    
    const messages = await getAllMessages(channelName)

    if(messages.length === 0){
        return new Response(JSON.stringify([]), { status: 200 });
    }
    else{   
        return new Response(JSON.stringify(messages), { status: 200 })
    }
}
