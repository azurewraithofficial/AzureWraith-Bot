import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export const name = 'guildBanRemove';

export async function execute(ban) {
    const MOD_LOG_CHANNEL_ID = '1508526124055920811';
    const logChannel = ban.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
    if (!logChannel) return;

    await new Promise(resolve => setTimeout(resolve, 1000));
    const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove }).catch(() => null);
    const unbanLog = fetchedLogs?.entries.first();

    const moderator = unbanLog ? unbanLog.executor : 'Unknown Staff/System';
    const reason = unbanLog?.reason || 'No revocation statement provided.';

    const logEmbed = new EmbedBuilder()
        .setColor('#00FF7F') // Emerald Green
        .setTitle('<:Mark:1509557248534253568> Guild System Registry: Blacklist Revoked (Unbanned)')
        .addFields(
            { name: '<:Member:1509557217961967716> Pardoned Account', value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
            { name: '<:Staff:1509557210861142186> Authorizing Staff', value: `${moderator}`, inline: true },
            { name: '<:Bell:1509557209363775638> Revocation Statement', value: `\`\`\`\n${reason}\n\`\`\`` }
        )
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
}
