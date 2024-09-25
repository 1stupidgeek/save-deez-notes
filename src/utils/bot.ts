import { ChannelType, Client, GatewayIntentBits, Guild, Message, TextChannel } from "discord.js";

process.setMaxListeners(0);
let client: Client | null = null;
let clientReady = false;

interface ChannelInfo {
    id: string;
    name: string;
    type: ChannelType;
}

export async function getClient(): Promise<Client> {
    if (!client) {
        client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });

        client.once("ready", () => {
            console.log(`Logged in as ${client!.user?.tag}!`);
            clientReady = true;
        });

        await client.login(process.env.DISCORD_TOKEN);
    }

if (!clientReady) {
    await new Promise<void>(resolve => {
        client!.once('ready', () => {
            resolve();
        });
    });
}

    return client;
}

export async function getChannelByName(client: Client, channelName: string): Promise<TextChannel | null> {
    console.log("Finding channel:", channelName);
    const guild = await getGuild(client);
    return guild.channels.cache.find(channel => channel.name === channelName) as TextChannel || null;
}

export async function createNewChannel(channelName: string): Promise<TextChannel | false> {
    try {
        const client = await getClient();
        const guild = await getGuild(client);

        if (!channelName.trim()) {
            console.log("Channel name cannot be empty");
            return false;
        }

        await guild.channels.fetch();

        if (guild.channels.cache.some(channel => channel.name.toLowerCase() === channelName.toLowerCase())) {
            console.log(`Channel "${channelName}" already exists.`);
            return false;
        }

        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `This channel was created by the bot on ${new Date().toLocaleString()}`,
        });

        console.log(`New channel created: #${newChannel.name}`);
        return newChannel;
    } catch (error) {
        console.error("Error in createNewChannel:", error);
        return false;
    }
}

export async function changeTitle(channelName: string, newTitle: string) {
    const client = await getClient();
    const channel = await getChannelByName(client, channelName);

    if (!channel) {
        console.log(`Channel "${channelName}" does not exist.`);
        return;
    }

    const normalizedNewTitle = newTitle.trim().split(" ").join("-").toLowerCase();
    const normalizedChannelName = channel.name.trim().toLowerCase();

    if (normalizedChannelName !== normalizedNewTitle) {
        await channel.setName(normalizedNewTitle);
        console.log(`Channel title changed to: ${normalizedNewTitle}`);
    } else {
        console.log(`Channel title is already set to: ${normalizedNewTitle}`);
    }
}

export async function getAllChannels(): Promise<ChannelInfo[]> {
    try {
        const client = await getClient();
        const guild = await getGuild(client);
        await guild.channels.fetch();

        return guild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type
        }));
    } catch (error) {
        console.error("Failed to get channels:", error);
        return [];
    }
}

async function getGuild(client: Client): Promise<Guild> {
    const guild = client.guilds.cache.first();
    if (!guild) throw new Error("Guild not found");
    return guild;
}

export async function sendMessage(message: string, currentNote: string) {
    const client = await getClient();
    const channel = await getChannelByName(client, currentNote);

    if (!channel) {
        console.log(`Failed to find channel: ${currentNote}`);
        return null;
    }

    return await channel.send(message);
}

export async function editMessage(message: { content: string; id: string; currentNote: string }) {
    const client = await getClient();
    const channel = await getChannelByName(client, message.currentNote);

    if (!channel) {
        console.log(`Failed to find channel: ${message.currentNote}`);
        return null;
    }

    const messageToEdit = await channel.messages.fetch(message.id);
    return await messageToEdit.edit(message.content);
}

export async function deleteMessage(messageId: string, currentNote: string): Promise<string> {
    const client = await getClient();
    const channel = await getChannelByName(client, currentNote);

    if (!channel) return `Failed to find channel: ${currentNote}`;

    const messageToDelete = await channel.messages.fetch(messageId);
    await messageToDelete.delete();
    return `Message with ID ${messageId} successfully deleted`;
}

export async function getAllMessages(channelName: string) {
    const client = await getClient();
    const channel = await getChannelByName(client, channelName);

    if (!channel) {
        console.log(`Failed to find channel: ${channelName}`);
        return null;
    }

    const messages = await fetchAllMessages(channel);

    return messages.map(message => ({
        id: message.id,
        content: message.content,
        timestamp: message.createdAt,
    }));
}

async function fetchAllMessages(channel: TextChannel) {
    let allMessages: Message[] = [];
    let lastId: string | undefined;

    while (true) {
        const options: { limit: number; before?: string } = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        allMessages = allMessages.concat(Array.from(messages.values()));

        if (messages.size < 100) break;
        lastId = messages.last()?.id;
    }

    return allMessages;
}
