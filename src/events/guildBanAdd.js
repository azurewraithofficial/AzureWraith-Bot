import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export const name = 'guildBanAdd';

export async function execute(ban) {
    const MOD_LOG_CHANNEL_ID = '1508526124055920811';
    const logChannel = ban.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
    if (!logChannel) return;

    await new Promise(resolve => setTimeout(resolve, 1000));
    const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd }).catch(() => null);
    const banLog = fetchedLogs?.entries.first();

    const moderator = banLog ? banLog.executor : 'Unknown Staff/System';
    const reason = banLog?.reason || 'No system parameter statement provided.';

    const logEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('<:Warning:1509557251181117500> Guild System Registry: User Permanently Banned')
        .addFields(
            { name: '<:Member:1509557217961967716> Target Account', value: `${ban.user} (\`${ban.user.id}\`)`, inline: true },
            { name: '<:Staff:1509557210861142186> Enforcing Staff', value: `${moderator}`, inline: true },
            { name: '<:Bell:1509557209363775638> Case Audit Reason', value: `\`\`\`\n${reason}\n\`\`\`` }
        )
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
}
