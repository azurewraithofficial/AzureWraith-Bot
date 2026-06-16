import { EmbedBuilder } from 'discord.js';

export const name = 'messageDelete';

export async function execute(message) {
    // Ignore direct messages, bot actions, or uncached partial messages
    if (!message.guild || message.author?.bot) return;

    const LOG_CHANNEL_ID = '1508526453640265738';
    
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        member: '<:Member:1509557217961967716>',
        bell: '<:Bell:1509557209363775638>'
    };

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    // Truncate long content blocks to prevent embed overflow errors (Max 1024 char limit)
    const rawContent = message.content || '*No text content (likely an attachment or embed structure)*';
    const cleanContent = rawContent.length > 950 ? `${rawContent.substring(0, 950)}...` : rawContent;

    const deletionEmbed = new EmbedBuilder()
        .setColor('#FF3333') // Alert Crimson
        .setTitle(`${emoji.warning} Data Core: Message Purged`)
        .setDescription(`>>> A message has been systematically deleted from the server matrix archive.`)
        .addFields(
            {
                name: `${emoji.member} __AUTHOR PROFILER__`,
                value: `* **User Account:** ${message.author}\n* **Account Tag:** \`${message.author.tag}\`\n* **Account ID:** \`${message.author.id}\``,
                inline: true
            },
            {
                name: `📍 __LOCATION DATA__`,
                value: `* **Channel Link:** ${message.channel}\n* **Channel ID:** \`${message.channel.id}\``,
                inline: true
            },
            {
                name: `${emoji.bell} __ERASED PAYLOAD__`,
                value: `\`\`\`\n${cleanContent}\n\`\`\``,
                inline: false
            }
        )
        .setTimestamp();

    // If an image attachment was present, display it inside the logging frame
    if (message.attachments.size > 0) {
        const attachmentList = message.attachments.map(a => `[${a.name}](${a.url})`).join('\n');
        deletionEmbed.addFields({ name: '📎 __ATTACHED FILE METADATA__', value: attachmentList, inline: false });
    }

    await logChannel.send({ embeds: [deletionEmbed] }).catch(() => null);
}
