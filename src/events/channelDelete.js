import { EmbedBuilder, AuditLogEvent } from 'discord.js';

// Localized deletion tracking cache tracking executors over a rolling 60-second block
const deletionTracker = new Map();

export const name = 'channelDelete';

export async function execute(channel) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        bell: '<:Bell:1509557209363775638>',
        staff: '<:Staff:1509557210861142186>'
    };

    const config = global.securityConfig || { antiNuke: true, deleteThreshold: 3 };
    if (!config.antiNuke) return;

    const guild = channel.guild;
    const now = Date.now();

    // Fetch the recent audit log records to isolate the specific user who deleted the channel
    const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete,
    }).catch(() => null);

    if (!fetchedLogs) return;
    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return;

    const { executor, target } = deletionLog;
    
    // Safety check: Bypass processing if the deletion was executed by the application bot core itself or guild owner
    if (executor.id === guild.client.user.id || executor.id === guild.ownerId) return;
    // Verify audit log match correlation target
    if (target.id !== channel.id) return;

    if (!deletionTracker.has(executor.id)) {
        deletionTracker.set(executor.id, []);
    }

    const trackingArray = deletionTracker.get(executor.id);
    const recentDeletions = trackingArray.filter(time => now - time < 60000);
    
    recentDeletions.push(now);
    deletionTracker.set(executor.id, recentDeletions);

    // Malice threshold verification check
    if (recentDeletions.length >= config.deleteThreshold) {
        try {
            const rogueMember = await guild.members.fetch(executor.id).catch(() => null);

            if (rogueMember) {
                // 1. STRIP REQUISITE ROLES INSULATION STEP: Neutralize account immediately
                const targetRoles = rogueMember.roles.cache.filter(role => role.id !== guild.id);
                await rogueMember.roles.remove(targetRoles, 'CRITICAL SECURITY BREACH: Exceeded rapid channel deletion limit thresholds.').catch(() => null);
            }

            // 2. COUNTER-MEASURE RECOVERY VECTOR: Clone asset profile mapping back into hierarchy positioning
            const recoveredChannel = await channel.clone({
                reason: 'CRITICAL SECURITY SYSTEM: Automated Anti-Nuke rollback recovery initialization sequence.',
                position: channel.rawPosition
            }).catch(() => null);

            // 3. TELEMETRY LOG DISPATCHMENT LINK
            const loggingChannel = guild.channels.cache.find(c => c.name.includes('security') || c.name.includes('mod') || c.name.includes('log'));
            if (loggingChannel) {
                const isolationEmbed = new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} INTERNAL DEFENSE CRISIS: Malicious Activity Terminated`)
                    .setDescription(`>>> **Anti-Nuke Interceptor Engaged:** A staff profile account reached critical operational limits while executing catastrophic data deletions. Administrative keys have been stripped.`)
                    .addFields(
                        {
                            name: `${emoji.staff} __OFFENDER INVENTORY PROFILE__`,
                            value: `* **User Account:** ${executor} (${executor.tag})\n* **Account ID:** \`${executor.id}\``,
                            inline: true
                        },
                        {
                            name: `🚨 __THREAT LEVEL MATRIX__`,
                            value: `* **Action Logged:** Channel Destructions\n* **Velocity Matrix:** \`${recentDeletions.length} channels deleted inside 60s.\``,
                            inline: true
                        },
                        {
                            name: `🛠️ __AUTOMATED RECOVERY REPORT__`,
                            value: `* **Target Element:** \`#${channel.name}\`\n* **Current Status:** Roles stripped successfully. Channel structure cloned back to position reference: <#${recoveredChannel?.id || channel.id}>`,
                            inline: false
                        }
                    )
                    .setTimestamp();

                await loggingChannel.send({ embeds: [isolationEmbed] });
            }

            // Flush system tracing cache logs for the isolated executor profile index
            deletionTracker.delete(executor.id);

        } catch (err) {
            console.error('Critical interception failure occurred on security state matrix execution wrapper:', err);
        }
    }
}
