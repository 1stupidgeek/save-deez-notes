import { AES, enc } from "crypto-js";
import {
  AttachmentBuilder,
  ChannelType,
  Client,
  GatewayIntentBits,
  Guild,
  TextChannel,
} from "discord.js";

process.setMaxListeners(0);
const KEY = process.env.KEY!;
const GUILD_ID = process.env.GUILD_ID!;

let client: Client | null = null;
let clientReady = false;

interface ChannelInfo {
  id: string;
  name: string;
}

export async function getClient(): Promise<Client> {
  if (!client) {
    client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    client.once("ready", () => {
      console.log(`Logged in as ${client!.user?.tag}!`);
      clientReady = true;
    });

    await client.login(process.env.DISCORD_TOKEN);
  }

  if (!clientReady) {
    await new Promise<void>((resolve) => {
      client!.once("ready", () => {
        resolve();
      });
    });
  }

  return client;
}

export async function getChannelByName(
  client: Client,
  channelName: string,
): Promise<TextChannel | null> {
  const guild = await getGuild(client);

  return (
    (guild.channels.cache.find(
      (channel) => channel.name === channelName,
    ) as TextChannel) || null
  );
}

export async function createNewChannel(
  channelName: string,
): Promise<TextChannel | false> {
  try {
    const client = await getClient();
    const guild = await getGuild(client);

    if (!channelName.trim()) {
      return false;
    }

    await guild.channels.fetch();

    const newChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      topic: `This channel was created by the bot on ${new Date().toLocaleString()}`,
    });

    return newChannel;
  } catch (error) {
    console.error("Error in createNewChannel:", error);
    return false;
  }
}

export async function deleteChannel(id: string) {
  const client = await getClient();
  const guild = await getGuild(client);
  const channel = guild.channels.cache.get(id);

  try {
    if (!channel) {
      return false;
    }

    await channel.delete();
  } catch (e) {
    console.error("Unable to delete channel - ", e);
    throw new Error("Unable to delete channel");
  }
}

export async function changeTitle(id: string, title: string) {
  const client = await getClient();
  const guild = await getGuild(client);
  const channel = guild.channels.cache.get(id);

  if (!channel || channel.name == title) {
    return false;
  }

  await channel.setName(title);
  return true;
}

export async function getAllChannels(): Promise<ChannelInfo[]> {
  try {
    const client = await getClient();
    const guild = await getGuild(client);
    await guild.channels.fetch();

    return guild.channels.cache
      .filter((channel) => channel.type === ChannelType.GuildText)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
      }));
  } catch (error) {
    console.error("Failed to get channels:", error);
    return [];
  }
}

async function getGuild(client: Client): Promise<Guild> {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) throw new Error("Guild not found");
  return guild;
}

export async function sendMessage(channelId: string, message: string) {
  const client = await getClient();
  const guild = await getGuild(client);
  const channel = guild.channels.cache.get(channelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    return null;
  }

  try {
    const content = KEY ? AES.encrypt(message, KEY).toString() : message;
    const buffer = Buffer.from(content, "utf-8");
    const attachment = new AttachmentBuilder(buffer, { name: "message.txt" });

    return await channel.send({ files: [attachment] });
  } catch (error) {
    console.error("Error encrypting and sending message:", error);
    return null;
  }
}

export async function getLatestMessage(channelId: string) {
  const client = await getClient();
  const guild = await getGuild(client);
  const channel = guild.channels.cache.get(channelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    return null;
  }

  const message = (await channel.messages.fetch()).first();

  if (!message || !message.attachments.first()) {
    return { id: null, content: null, timestamp: null };
  }

  const attachment = message.attachments.first();

  try {
    let content;
    if (attachment) {
      const response = await fetch(attachment.url);
      const arrayBuffer = await response.arrayBuffer();
      const fileContent = Buffer.from(arrayBuffer).toString("utf-8");
      content = KEY
        ? AES.decrypt(fileContent, KEY).toString(enc.Utf8)
        : fileContent;
    }

    return {
      id: message.id,
      content: content,
      timestamp: message.createdAt,
    };
  } catch (error) {
    console.error("Error retrieving and decrypting message:", error);
    return { id: message.id, content: null, timestamp: message.createdAt };
  }
}
