// logic for strings i don't want to loose this :sob:

// import { AES, enc } from "crypto-js";
// import { ChannelType, Client, GatewayIntentBits, Guild, Message, TextChannel } from "discord.js";

// process.setMaxListeners(0);
// const KEY = process.env.KEY!;

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

//         client.once("ready", () => {
//             console.log(`Logged in as ${client!.user?.tag}!`);
//             clientReady = true;
//         });

//         await client.login(process.env.DISCORD_TOKEN);
//     }

//     if (!clientReady) {
//         await new Promise<void>(resolve => {
//             client!.once('ready', () => {
//                 resolve();
//             });
//         });
//     }

//     return client;
// }

// export async function getChannelByName(client: Client, channelName: string): Promise<TextChannel | null> {
//     console.log("Finding channel:", channelName);
//     const guild = await getGuild(client);

//     return guild.channels.cache.find(channel => channel.name === channelName) as TextChannel || null;
// }

// export async function createNewChannel(channelName: string): Promise<TextChannel | false> {
//     try {
//         const client = await getClient();
//         const guild = await getGuild(client);

//         if (!channelName.trim()) {
//             console.log("Channel name cannot be empty");
//             return false;
//         }

//         await guild.channels.fetch();

//         if (guild.channels.cache.some(channel => channel.name.toLowerCase() === channelName.toLowerCase())) {
//             console.log(`Channel "${channelName}" already exists.`);
//             return false;
//         }

//         const newChannel = await guild.channels.create({
//             name: channelName,
//             type: ChannelType.GuildText,
//             topic: `This channel was created by the bot on ${new Date().toLocaleString()}`,
//         });

//         console.log(`New channel created: #${newChannel.name}`);
//         return newChannel;
//     } catch (error) {
//         console.error("Error in createNewChannel:", error);
//         return false;
//     }
// }

// export async function changeTitle(channelName: string, newTitle: string) {
//     const client = await getClient();
//     const channel = await getChannelByName(client, channelName);

//     if (!channel) {
//         console.log(`Channel "${channelName}" does not exist.`);
//         return;
//     }

//     const normalizedNewTitle = newTitle.trim();
//     const normalizedChannelName = channel.name.trim();

//     if (normalizedChannelName !== normalizedNewTitle) {
//         await channel.setName(normalizedNewTitle);
//         console.log(`Channel title changed to: ${normalizedNewTitle}`);
//     } else {
//         console.log(`Channel title is already set to: ${normalizedNewTitle}`);
//     }
// }

// export async function getAllChannels(): Promise<ChannelInfo[]> {
//     try {
//         const client = await getClient();
//         const guild = await getGuild(client);
//         await guild.channels.fetch();

//         return guild.channels.cache.map(channel => ({
//             id: channel.id,
//             name: channel.name,
//             type: channel.type
//         }));
//     } catch (error) {
//         console.error("Failed to get channels:", error);
//         return [];
//     }
// }

// async function getGuild(client: Client): Promise<Guild> {
//     const guild = client.guilds.cache.first();
//     if (!guild) throw new Error("Guild not found");
//     return guild;
// }

// export async function sendMessage(message: string, currentNote: string) {
//     const client = await getClient();
//     const channel = await getChannelByName(client, currentNote);

//     if (!channel) {
//         console.log(`Failed to find channel: ${currentNote}`);
//         return null;
//     }

//     try {
//         const encrypted = AES.encrypt(message, KEY).toString();
//         return await channel.send(encrypted);
//     } catch (error) {
//         console.error("Error encrypting message:", error);
//         return null;
//     }
// }

// export async function editMessage(message: { content: string; id: string; currentNote: string }) {
//     const client = await getClient();
//     const channel = await getChannelByName(client, message.currentNote);

//     if (!channel) {
//         console.log(`Failed to find channel: ${message.currentNote}`);
//         return null;
//     }

//     try {
//         const messageToEdit = await channel.messages.fetch(message.id);
//         const encrypted = AES.encrypt(message.content, KEY).toString();
//         return await messageToEdit.edit(encrypted);
//     } catch (error) {
//         console.error("Error encrypting or editing message:", error);
//         return null;
//     }
// }

// export async function deleteMessage(messageId: string, currentNote: string): Promise<string> {
//     const client = await getClient();
//     const channel = await getChannelByName(client, currentNote);

//     if (!channel) return `Failed to find channel: ${currentNote}`;

//     try {
//         const messageToDelete = await channel.messages.fetch(messageId);
//         await messageToDelete.delete();
//         return `Message with ID ${messageId} successfully deleted`;
//     } catch (error) {
//         console.error("Error deleting message:", error);
//         return `Failed to delete message with ID ${messageId}: ${error.message}`;
//     }
// }

// export async function getAllMessages(channelName: string) {
//     const client = await getClient();
//     const channel = await getChannelByName(client, channelName);

//     if (!channel) {
//         console.log(`Failed to find channel: ${channelName}`);
//         return null;
//     }

//     const messages = await fetchAllMessages(channel);

//     return messages.map(message => {
//         let decryptedContent: string;
//         try {
//             decryptedContent = AES.decrypt(message.content, KEY).toString(enc.Utf8);
//             // If decryption results in an empty string, it's likely the message wasn't encrypted
//             if (!decryptedContent) {
//                 decryptedContent = message.content; // Use the original content
//                 console.log(`Message ${message.id} appears to be unencrypted. Using original content.`);
//             }
//         } catch (error) {
//             console.error(`Error decrypting message ${message.id}:`, error);
//             decryptedContent = `[Error decrypting message: ${error.message}]`;
//         }

//         return {
//             id: message.id,
//             content: decryptedContent,
//             timestamp: message.createdAt,
//         };
//     });
// }

// async function fetchAllMessages(channel: TextChannel) {
//     let allMessages: Message[] = [];
//     let lastId: string | undefined;

//     while (true) {
//         const options: { limit: number; before?: string } = { limit: 100 };
//         if (lastId) options.before = lastId;

//         const messages = await channel.messages.fetch(options);
//         allMessages = allMessages.concat(Array.from(messages.values()));

//         if (messages.size < 100) break;
//         lastId = messages.last()?.id;
//     }

//     return allMessages;
// }



// logic for file based posting

import { Buffer } from "buffer";
import { AES, enc } from "crypto-js";
import { AttachmentBuilder, ChannelType, Client, GatewayIntentBits, Guild, Message, TextChannel } from "discord.js";

process.setMaxListeners(0);
const KEY = process.env.KEY!;

let client: Client | null = null;
let clientReady = false;

interface ChannelInfo {
    id: string;
    name: string;
    type: ChannelType;
}

interface MessageMetadata {
    noteName: string;
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

    const normalizedNewTitle = newTitle.trim();
    const normalizedChannelName = channel.name.trim();

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

    try {
        const encrypted = AES.encrypt(message, KEY).toString();
        console.log(`Encrypted message (first 50 chars): ${encrypted.substring(0, 50)}...`);
        const buffer = Buffer.from(encrypted, 'utf-8');

        const metaData: MessageMetadata = {
            noteName: currentNote
        };

        const attachment = new AttachmentBuilder(buffer, {
            name: "message.txt",
            description: JSON.stringify(metaData)
        });

        const sentMessage = await channel.send({files: [attachment]});
        console.log(`Message sent successfully. ID: ${sentMessage.id}`);
        return sentMessage;
    } catch (error) {
        console.error("Error encrypting or sending message:", error);
        return null;
    }
}

export async function editMessage(message: { content: string; id: string; currentNote: string }) {
    const client = await getClient();
    const channel = await getChannelByName(client, message.currentNote);

    if (!channel) {
        console.log(`Failed to find channel: ${message.currentNote}`);
        return null;
    }

    try {
        const messageToEdit = await channel.messages.fetch(message.id);
        const encrypted = AES.encrypt(message.content, KEY).toString();
        console.log(`Encrypted edited message (first 50 chars): ${encrypted.substring(0, 50)}...`);
        const buffer = Buffer.from(encrypted, "utf-8");

        const oldAttachment = messageToEdit.attachments.first();
        const oldMetaData: MessageMetadata = oldAttachment?.description 
            ? JSON.parse(oldAttachment.description) 
            : { noteName: message.currentNote };

        const attachment = new AttachmentBuilder(buffer, {
            name: "message.txt",
            description: JSON.stringify(oldMetaData)
        });

        // remove old attachments and add the new one
        const editedMessage = await messageToEdit.edit({ content: "", files: [attachment] });
        console.log(`Message edited successfully. ID: ${editedMessage.id}`);
        return editedMessage;
    } catch (error) {
        console.error("Error encrypting or editing message:", error);
        return null;
    }
}

export async function deleteMessage(messageId: string, currentNote: string): Promise<string> {
    const client = await getClient();
    const channel = await getChannelByName(client, currentNote);

    if (!channel) return `Failed to find channel: ${currentNote}`;

    try {
        const messageToDelete = await channel.messages.fetch(messageId);
        await messageToDelete.delete();
        console.log(`Message deleted successfully. ID: ${messageId}`);
        return `Message with ID ${messageId} successfully deleted`;
    } catch (error) {
        console.error("Error deleting message:", error);
        return `Failed to delete message with ID ${messageId}`;
    }
}

export async function getAllMessages(channelName: string) {
    const client = await getClient();
    const channel = await getChannelByName(client, channelName);

    if (!channel) {
        console.log(`Failed to find channel: ${channelName}`);
        return null;
    }

    const messages = await fetchAllMessages(channel);

    return Promise.all(messages.map(async (message) => {
        let decryptedContent: string = "";
        let metadata: MessageMetadata | null = null;

        try {
            if (message.attachments.size > 0) {
                const attachment = message.attachments.first()!;
                const fileContent = await downloadAttachment(attachment.url);
                
                try {
                    decryptedContent = AES.decrypt(fileContent, KEY).toString(enc.Utf8);
                    console.log(`Decrypted content (first 50 chars): ${decryptedContent.substring(0, 50)}...`);
                } catch (error) {
                    console.error(`Decryption error for message ${message.id}:`, error);
                    decryptedContent = `[Decryption failed: ${error}]`;
                }

                if (attachment.description) {
                    try {
                        metadata = JSON.parse(attachment.description);
                        console.log(`Parsed metadata:`, metadata);
                    } catch (metadataError) {
                        console.error(`Metadata parsing error for message ${message.id}:`, metadataError);
                    }
                }
            } else {
                // for old messages or messages sent without encryption
                decryptedContent = message.content;
                console.log(`Message ${message.id} doesn't have an attachment. Using original content.`);
            }

            if (!decryptedContent) {
                throw new Error("Decryption resulted in empty string");
            }
        } catch (error) {
            console.error(`Error processing message ${message.id}:`, error);
            decryptedContent = `[Error processing message: ${error}]`;
        }

        return {
            id: message.id,
            content: decryptedContent,
            timestamp: message.createdAt,
            metadata: metadata
        };
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

    // console.log(allMessages)

    return allMessages;
}

async function downloadAttachment(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('utf-8');
}