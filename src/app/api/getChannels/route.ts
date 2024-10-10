export const dynamic = "force-dynamic";

import { getAllChannels, getClient } from "@/utils/bot";

export async function GET() {
  try {
    const client = await getClient();
    if (!client.isReady()) {
      await new Promise<void>((resolve) => {
        client.once("ready", () => {
          resolve();
        });
      });
    }

    const guild = client.guilds.cache.first();

    if (!guild) {
      throw new Error("Guild not found");
    }

    const channels = await getAllChannels();
    const str = JSON.stringify(channels);

    return new Response(str, { status: 200 });
  } catch (e) {
    console.error("Unable to get messages :(", e);
    throw new Error("Unable to get Messages :(");
  }
}
