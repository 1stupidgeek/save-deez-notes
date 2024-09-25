// import { ChannelType, Client, GatewayIntentBits, Guild, GuildBasedChannel, GuildChannel, Message, TextChannel } from "discord.js";
// process.setMaxListeners(0);
// let client: Client | null = null;
// let clientReady = false;

// interface ChannelInfo {
//     id: string;
//     name: string;
//     type: ChannelType;
// }

// export async function getClient(): Promise<Client> {
//     if (!client) {
//         client = new Client({
//             intents: [
//                 GatewayIntentBits.Guilds,
//                 GatewayIntentBits.GuildMessages,
//             ],
//         });

//         await new Promise<void>((resolve) => {
//             client!.once("ready", () => {
//                 console.log(`Logged in as ${client!.user!.tag}!`);
//                 clientReady = true;
//                 resolve();
//             });
//         });

//         await client.login(process.env.DISCORD_TOKEN);
//     }

//     return client;
// }


// export async function sendMessage(message: string, currentNote: string) {
//     const client = await getClient();

//     const guild = client.guilds.cache.first();
//     if (!guild) {
//         throw new Error("Guild not found");
//     }

//     const generalChannel = guild.channels.cache.find(channel => channel.name === currentNote) as TextChannel;
//     if (!generalChannel) {
//         throw new Error("Channel not found");
//     }

//     const response = await generalChannel.send(message);
//     return response;
// }

// export async function editMessage(message: { content: string, id: string, currentNote: string }) {
//     const client = await getClient();

//     const guild = client.guilds.cache.first();
//     if (!guild) {
//         throw new Error("Guild not found");
//     }

//     const generalChannel = guild.channels.cache.find(channel => channel.name === message.currentNote) as TextChannel;
//     if (!generalChannel) {
//         throw new Error("Channel not found");
//     }
//     const messageToEdit = await generalChannel.messages.fetch(message.id);
//     await messageToEdit.edit(message.content);
// }

// export async function deleteMessage(messageId: string, currentNote: string): Promise<string> {
//     try {
//         const client = await getClient();
//         const guild = client.guilds.cache.first();
//         if (!guild) {
//             throw new Error("Guild not found");
//         }
//         const generalChannel = guild.channels.cache.find(channel => channel.name === currentNote) as TextChannel;
//         if (!generalChannel) {
//             throw new Error("Channel not found");
//         }

//         const messageToDelete = await generalChannel.messages.fetch(messageId);
//         await messageToDelete.delete();
//         return `Message with ID ${messageId} successfully deleted`;
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`Failed to delete message: ${error.message}`);
//         } else {
//             throw new Error('An unknown error occurred while deleting the message');
//         }
//     }
// }

// export async function getAllChannels(): Promise<ChannelInfo[]> {
//     try {
//         const client = await getClient();
//         const guild: Guild | undefined = client.guilds.cache.first();
//         if (!guild) {
//             throw new Error("Guild not found");
//         }

//         await guild.channels.fetch();

//         const allChannels: ChannelInfo[] = Array.from(guild.channels.cache.values()).map(channel => ({
//             id: channel.id,
//             name: channel.name,
//             type: channel.type
//         }));

//         return allChannels;

//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`Failed to get channels: ${error.message}`);
//         } else {
//             throw new Error('An unknown error occurred while getting channels');
//         }
//     }
// }

// export async function createNewChannel(channelName: string): Promise<TextChannel | false> {
//     try {
//         const client = await getClient();
//         const guild: Guild | undefined = client.guilds.cache.first();
//         if (!guild) {
//             throw new Error("Guild not found");
//         }

//         if (!channelName || channelName.trim() === '') {
//             throw new Error("Channel name is required and cannot be empty");
//         }

//         await guild.channels.fetch();

//         const allChannels: ChannelInfo[] = Array.from(guild.channels.cache.values()).map(channel => ({
//             id: channel.id,
//             name: channel.name.toLowerCase(),
//             type: channel.type
//         }));

//         // check if the channel already exists
//         const channelExists = allChannels.some(channel => channel.name === channelName.toLowerCase());
//         if (channelExists) {
//             console.log(`Channel "${channelName}" already exists.`);
//             return false;
//         }

//         // create the new channel
//         const newChannel = await guild.channels.create({
//             name: channelName,
//             type: ChannelType.GuildText,
//             topic: `This channel was created by the bot on ${new Date().toLocaleString()}`,
//         });

//         console.log(`New channel created: #${newChannel.name}`);
//         return newChannel;
//     } catch (error) {
//         console.error("Error in createNewChannel:", error);
//         if (error instanceof Error) {
//             throw new Error(`Failed to create channel: ${error.message}`);
//         } else {
//             throw new Error('An unknown error occurred while creating the channel');
//         }
//     }
// }

// export async function getAllMessages(channelName: string) {
//     // function which loops over all the messages 
//     async function fetchAllMessages(channel: TextChannel) {
//         let allMessages: Message[] = [];
//         let lastId: string | undefined;

//         while (true) {
//             const options: { limit: number, before?: string } = { limit: 100 };
//             if (lastId) options.before = lastId;

//             const messages = await channel.messages.fetch(options);
//             allMessages = allMessages.concat(Array.from(messages.values()));

//             if (messages.size < 100) break;
//             lastId = messages.last()?.id;
//         }
//         return allMessages;
//     }

//     try {
//         const client = await getClient();
//         if (!client.isReady()) {
//             await new Promise<void>((resolve) => {
//                 client.once("ready", () => {
//                     resolve();
//                 });
//             });
//         }

//         const guild = client.guilds.cache.first();
//         if (!guild) {
//             throw new Error("Guild not found");
//         }

//         let channel = guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;

//         // if the channel doesn't exist, create it
//         if (!channel) {
//             const newChannel = await createNewChannel(channelName);
//             if (!newChannel) {
//                 return [];
//             }
//             channel = newChannel;
//         }

//         // getting all the messages 
//         const messages = await fetchAllMessages(channel);

//         const messageData = messages.map(message => ({
//             id: message.id,
//             content: message.content,
//             timestamp: message.createdAt
//         }));

//         return messageData;
//     } catch (error) {
//         console.error("Unable to get messages:", error);
//         throw new Error("Unable to get Messages :(");
//     }
// }

import { ChannelType, Client, GatewayIntentBits, Guild, GuildBasedChannel, GuildChannel, Message, TextChannel } from "discord.js";
process.setMaxListeners(0);
let client: Client | null = null;
let clientReady = false;

interface ChannelInfo {
    id: string;
    name: string;
    type: string;
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
            console.log(`Logged in as ${client?.user?.tag}!`);
            clientReady = true;
        });

        await client.login(process.env.DISCORD_TOKEN);

        if (!clientReady) {
            await new Promise<void>((resolve) => {
                //@ts-ignore
                client?.once("ready", resolve);
            });
        }
    }

    return client;
}

export async function sendMessage(message: string, currentNote: string) {
    const client = await getClient();

    const guild = client.guilds.cache.first();
    if (!guild) {
        throw new Error("Guild not found");
    }

    const generalChannel = guild.channels.cache.find(channel => channel.name === currentNote) as TextChannel;
    if (!generalChannel) {
        throw new Error("Channel not found");
    }

    const response = await generalChannel.send(message);
    return response;
}

export async function editMessage(message: { content: string, id: string, currentNote: string }) {
    const client = await getClient();

    const guild = client.guilds.cache.first();
    if (!guild) {
        throw new Error("Guild not found");
    }

    const generalChannel = guild.channels.cache.find(channel => channel.name === message.currentNote) as TextChannel;
    if (!generalChannel) {
        throw new Error("Channel not found");
    }
    const messageToEdit = await generalChannel.messages.fetch(message.id)
    await messageToEdit.edit(message.content);
}

export async function deleteMessage(messageId: string, currentNote: string): Promise<string> {
    try {
        const client = await getClient();
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error("Guild not found");
        }
        const generalChannel = guild.channels.cache.find(channel => channel.name === currentNote) as TextChannel;
        if (!generalChannel) {
            throw new Error("Channel not found");
        }

        let messageToDelete: Message;
        try {
            messageToDelete = await generalChannel.messages.fetch(messageId);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Unknown Message')) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            throw error;
        }

        await messageToDelete.delete();
        return `Message with ID ${messageId} successfully deleted`;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while deleting the message');
        }
    }
}


export async function getAllChannels(): Promise<ChannelInfo[]> {
    try {
        const client = await getClient()
        const guild: Guild | undefined = client.guilds.cache.first();
        if (!guild) {
            throw new Error("Guild not found");
        }

        await guild.channels.fetch();

        const allChannels: ChannelInfo[] = Array.from(guild.channels.cache.values()).map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type
        }));

        return allChannels;

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get channels: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while getting channels');
        }
    }
}

export async function createNewChannel(channelName: string): Promise<TextChannel | false> {
    try {
        const client = await getClient();
        const guild: Guild | undefined = client.guilds.cache.first();
        if (!guild) {
            throw new Error("Guild not found");
        }

        if (!channelName || channelName.trim() === '') {
            throw new Error("Channel name is required and cannot be empty");
        }

        await guild.channels.fetch();

        const allChannels: ChannelInfo[] = Array.from(guild.channels.cache.values()).map(channel => ({
            id: channel.id,
            name: channel.name.toLowerCase(),
            type: channel.type
        }));

        // check if the channel already exists
        const channelExists = allChannels.some(channel => channel.name === channelName);
        if (channelExists) {
            console.log(`Channel "${channelName}" already exists.`);
            return false;
        }

        // create the new channel
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `This channel was created by the bot on ${new Date().toLocaleString()}`,
        });

        console.log(`New channel created: #${newChannel.name}`);
        return newChannel;
    } catch (error) {
        console.error("Error in createNewChannel:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to create channel: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while creating the channel');
        }
    }
}

export async function getAllMessages(channelName: string) {

    // function which loops over all the messages 
    async function fetchAllMessages(channel: TextChannel) {
        let allMessages: Message[] = [];
        let lastId: string | undefined;

        while (true) {
            const options: { limit: number, before?: string } = { limit: 100 };
            if (lastId) options.before = lastId;

            const messages = await channel.messages.fetch(options);
            allMessages = allMessages.concat(Array.from(messages.values()));

            if (messages.size < 100) break 
            lastId = messages.last()?.id

        }
        return allMessages;
    }


    try {
        const client = await getClient();
        if (!client.isReady()) {
            await new Promise<void>((resolve) => {
                client.once("ready", () => {
                    resolve();
                })
            })
        }

        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error("Guild not found");
        }

        let channel = guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;

        // if the channel doesnt exist create it;
        if (!channel) {
            const newChannel = await createNewChannel(channelName);
            if (!newChannel) {
                return [];
            }
            channel = newChannel;
        }

        // getting all the messages 
        const messages = await fetchAllMessages(channel)

        const messageData = messages.map(message => ({
            id: message.id,
            content: message.content,
            timestamp: message.createdAt
        }));

        const str = messageData;


        return str;
    }
    catch (e) {
        console.error("Unable to get messages :(", e);
        throw new Error("Unable to get Messages :(")
    }

}