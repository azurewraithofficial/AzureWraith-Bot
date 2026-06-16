import { EmbedBuilder } from 'discord.js';

export const name = 'messageUpdate';

export async function execute(oldMessage, newMessage) {
    // Ignore bot adjustments, system updates, or unmutated message transitions (e.g. link embed pre-fetches)
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const LOG_CHANNEL_ID = '1508526453640265738';

    const emoji = {
        mark: '<:Mark:1509557248534253568>',
        member: '<:Member:1509557217961967716>',
        bell: '<:Bell:1509557209363775638>'
    };

    const logChannel = oldMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    // Safety padding for text arrays
    const oldContent = oldMessage.content ? (oldMessage.content.length > 450 ? `${oldMessage.content.substring(0, 450)}...` : oldMessage.content) : '*No text parsed*';
    const newContent = newMessage.content ? (newMessage.content.length > 450 ? `${newMessage.content.substring(0, 450)}...` : newMessage.content) : '*No text parsed*';

    const editEmbed = new EmbedBuilder()
        .setColor('#007FFF') // True Azure Blue
        .setTitle(`${emoji.mark} Data Core: Message Mutation Logged`)
        .setDescription(`>>> A transmission data packet has been altered by its original broadcast author.`)
        .addFields(
            {
                name: `${emoji.member} __AUTHOR PROFILER__`,
                value: `* **User Account:** ${oldMessage.author}\n* **Account ID:** \`${oldMessage.author.id}\``,
                inline: true
            },
            {
                name: `📍 __LOCATION DATA__`,
                value: `* **Channel Link:** ${oldMessage.channel}\n* **Trace Index:** [Jump to Message](${newMessage.url})`,
                inline: true
            },
            {
                name: `${emoji.bell} __ORIGINAL MATRIX BLOCK__`,
                value: `\`\`\`\n${oldContent}\n\`\`\``,
                inline: false
            },
            {
                name: `✨ __MODIFIED MATRIX BLOCK__`,
                value: `\`\`\`\n${newContent}\n\`\`\``,
                inline: false
            }
        )
        .setTimestamp();

    await logChannel.send({ embeds: [editEmbed] }).catch(() => null);
}
