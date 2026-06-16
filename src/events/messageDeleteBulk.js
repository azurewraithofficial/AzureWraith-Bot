import { EmbedBuilder } from 'discord.js';

export const name = 'messageDeleteBulk';

export async function execute(messages) {
    const firstMessage = messages.first();
    if (!firstMessage || !firstMessage.guild) return;

    const LOG_CHANNEL_ID = '1508526453640265738';

    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>'
    };

    const logChannel = firstMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    // Collate unique participants involved in the purged database cache map
    const authors = [...new Set(messages.map(m => m.author ? `${m.author.tag} (\`${m.author.id}\`)` : 'Unknown User'))];
    const cleanAuthorsList = authors.slice(0, 4).join('\n* ') + (authors.length > 4 ? `\n* ...and ${authors.length - 4} more users.` : '');

    const bulkEmbed = new EmbedBuilder()
        .setColor('#FFA500') // Alert Orange
        .setTitle(`${emoji.warning} Security Matrix: Mass Purge Intercepted`)
        .setDescription(`>>> A diagnostic clear script or localized cleaning cycle has extracted bulk logs from active server memory.`)
        .addFields(
            {
                name: `🚨 __MASS TELEMETRY REPORT__`,
                value: `* **Target Sector:** ${firstMessage.channel}\n* **Extraction Size:** \`${messages.size} Messages\`\n* **Storage Channel ID:** \`${firstMessage.channel.id}\``,
                inline: false
            },
            {
                name: `${emoji.staff} __CACHED TARGET PARTICIPANTS__`,
                value: `* ${cleanAuthorsList || '*No users registered in cached packet.*'}`,
                inline: false
            },
            {
                name: '───────────────',
                value: `${emoji.bell} **Notice:** Internal database contents deleted via bulk command vectors cannot be isolated into individual singular payload sheets.`,
                inline: false
            }
        )
        .setTimestamp();

    await logChannel.send({ embeds: [bulkEmbed] }).catch(() => null);
}
