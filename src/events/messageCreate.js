import { EmbedBuilder } from 'discord.js';

export const name = 'messageCreate';

export async function execute(message) {
    // Terminate pipeline if the data originates from a bot to avoid recursive system feedback
    if (message.author.bot) return;

    const SOURCE_CHANNEL_ID = '1508523598338330686';
    const TARGET_CHANNEL_ID = '1508526779000950834';

    // Verify origin coordinates match the designated transmission zone
    if (message.channel.id !== SOURCE_CHANNEL_ID) return;

    const targetChannel = message.guild.channels.cache.get(TARGET_CHANNEL_ID);
    if (!targetChannel) {
        return console.error(`[Pipeline Error] Target destination channel ${TARGET_CHANNEL_ID} is inaccessible or missing.`);
    }

    const emoji = {
        mark: '<:Mark:1509557248534253568>',
        member: '<:Member:1509557217961967716>'
    };

    // ────────────────────────────────────────────────────────────────────────
    // DATA PACKET COMPILED SCHEMATIC
    // ────────────────────────────────────────────────────────────────────────
    const forwardEmbed = new EmbedBuilder()
        .setColor('#007FFF') // True Azure Blue
        .setAuthor({ 
            name: `${message.author.tag}`, 
            iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        })
        .setDescription(message.content || '*[Message data containing asset payload only]*')
        .addFields({
            name: `${emoji.member} __METRIC ORIGIN__`,
            value: `* **Sender:** ${message.author}\n* **Account ID:** \`${message.author.id}\`\n* **Channel Node:** ${message.channel}`,
            inline: false
        })
        .setFooter({ text: `Azure Systems Telemetry Link • Channel ID: ${message.channel.id}` })
        .setTimestamp();

    // Map attachment URLs cleanly to prevent media drops (images, videos, files)
    const mediaPayload = Array.from(message.attachments.values()).map(attachment => attachment.url);

    try {
        await targetChannel.send({
            embeds: [forwardEmbed],
            files: mediaPayload
        });
    } catch (error) {
        console.error(`[Pipeline Fault] Critical exception during text stream routing:`, error);
    }
}
