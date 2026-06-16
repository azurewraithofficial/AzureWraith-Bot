import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export const name = 'guildMemberRemove';

export async function execute(member) {
    const MOD_LOG_CHANNEL_ID = '1508526124055920811';
    const logChannel = member.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
    if (!logChannel) return;

    // Await internal matrix state to parse audit log entry
    await new Promise(resolve => setTimeout(resolve, 1000));
    const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
    const kickLog = fetchedLogs?.entries.first();

    // Verify system telemetry confirmation that match conditions point to a staff kick action
    if (kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp) < 5000) {
        const moderator = kickLog.executor;
        const reason = kickLog.reason || 'No system parameter statement provided.';

        const logEmbed = new EmbedBuilder()
            .setColor('#FF3333') // Crimson Kick Warning
            .setTitle('<:PersonKick:1509557598691790968> Guild System Registry: User Kicked from Server')
            .addFields(
                { name: '<:Member:1509557217961967716> Target Account', value: `${member.user} (\`${member.user.id}\`)`, inline: true },
                { name: '<:Staff:1509557210861142186> Enforcing Staff', value: `${moderator}`, inline: true },
                { name: '<:Bell:1509557209363775638> Case Audit Reason', value: `\`\`\`\n${reason}\n\`\`\`` }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
    }
}
