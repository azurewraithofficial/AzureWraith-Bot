import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export const name = 'guildMemberUpdate';

export async function execute(oldMember, newMember) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>',
        staff: '<:Staff:1509557210861142186>',
        timeout: '<:Timeout:1509557597383168160>'
    };

    const guild = newMember.guild;
    const BOOST_ROLE_ID = '1508528048851517562';
    const MOD_LOG_CHANNEL_ID = '1508526124055920811';

    // ────────────────────────────────────────────────────────────────────────
    // SYSTEM MATRIX ALPHA: TIMEOUT TELEMETRY MONITOR
    // ────────────────────────────────────────────────────────────────────────
    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;

    if (oldTimeout !== newTimeout) {
        try {
            const modLogChannel = guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            
            if (modLogChannel) {
                // Short stall to allow Discord's internal audit engine to write the entry
                await new Promise(resolve => setTimeout(resolve, 1000));
                const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberUpdate }).catch(() => null);
                const updateLog = fetchedLogs?.entries.first();

                const moderator = updateLog ? updateLog.executor : 'Unknown Staff/System';
                const reason = updateLog?.reason || 'No statement entry specified.';

                // Logic Node A1: Timeout Added
                if (newTimeout > Date.now()) {
                    const expirationDate = new Date(newTimeout).toLocaleString();
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FFA500') // Warning Alert Orange
                        .setTitle(`${emoji.timeout} Guild System Registry: Isolation Timeout Issued`)
                        .addFields(
                            { name: `${emoji.member} Target Account`, value: `${newMember.user} (\`${newMember.user.id}\`)`, inline: true },
                            { name: `${emoji.staff} Enforcing Staff`, value: `${moderator}`, inline: true },
                            { name: '⌛ Restrict Expiration', value: `\`${expirationDate}\``, inline: false },
                            { name: `${emoji.bell} Audit Reason`, value: `\`\`\`\n${reason}\n\`\`\`` }
                        )
                        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    await modLogChannel.send({ embeds: [timeoutEmbed] }).catch(() => null);
                } 
                // Logic Node A2: Timeout Removed
                else if (!newTimeout && oldTimeout > Date.now()) {
                    const untimeoutEmbed = new EmbedBuilder()
                        .setColor('#00FF7F') // Emerald Revocation Green
                        .setTitle(`${emoji.mark} Guild System Registry: Timeout Revoked Early`)
                        .addFields(
                            { name: `${emoji.member} Target Account`, value: `${newMember.user} (\`${newMember.user.id}\`)`, inline: true },
                            { name: `${emoji.staff} Authorizing Staff`, value: `${moderator}`, inline: true },
                            { name: `${emoji.bell} Action Reason`, value: `\`\`\`\n${reason}\n\`\`\`` }
                        )
                        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    await modLogChannel.send({ embeds: [untimeoutEmbed] }).catch(() => null);
                }
            }
        } catch (err) {
            console.error(`[Telemetry Error] Failed processing native timeout log entry:`, err);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // SYSTEM MATRIX BETA: PREMIUM BOOST STATUS MONITOR
    // ────────────────────────────────────────────────────────────────────────
    const startedBoosting = !oldMember.premiumSince && newMember.premiumSince;
    const stoppedBoosting = oldMember.premiumSince && !newMember.premiumSince;

    if (startedBoosting || stoppedBoosting) {
        // Isolate fallback logging channel pipeline if custom configuration isn't explicit
        const boostLogChannel = guild.channels.cache.find(c => c.name.includes('security') || c.name.includes('mod') || c.name.includes('log'));

        // Logic Node B1: New Boost Triggered
        if (startedBoosting) {
            try {
                const role = await guild.roles.fetch(BOOST_ROLE_ID).catch(() => null);
                if (role) {
                    await newMember.roles.add(role, 'AUTOMATED MATRIX: Premium Nitro Server Boost rewards allocation.');

                    if (boostLogChannel) {
                        const boostEmbed = new EmbedBuilder()
                            .setColor('#007FFF') // True Azure Blue
                            .setTitle(`${emoji.mark} Premium Asset Array: Server Boost Logged`)
                            .setDescription(`>>> Thank you for boosting the server environment, ${newMember}! Your premium role matrix has been updated successfully.`)
                            .addFields(
                                {
                                    name: `${emoji.member} __MEMBER FOOTPRINT__`,
                                    value: `* **User Account:** ${newMember.user} (${newMember.user.tag})\n* **Account ID:** \`${newMember.user.id}\``,
                                    inline: true
                                },
                                {
                                    name: `💎 __PROMOTIONAL STATUS__`,
                                    value: `* **Allocation:** Active Server Booster\n* **Assigned Role:** <@&${BOOST_ROLE_ID}>`,
                                    inline: true
                                }
                            )
                            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                            .setTimestamp();

                        await boostLogChannel.send({ embeds: [boostEmbed] }).catch(() => null);
                    }
                } else {
                    console.error(`[Boost Error] Target Role ID ${BOOST_ROLE_ID} not found in guild registry.`);
                }
            } catch (err) {
                console.error(`Failed to execute automated boost role assignment:`, err);
            }
        }

        // Logic Node B2: Boost Terminated
        if (stoppedBoosting) {
            try {
                const role = await guild.roles.fetch(BOOST_ROLE_ID).catch(() => null);
                if (role) {
                    if (newMember.roles.cache.has(BOOST_ROLE_ID)) {
                        await newMember.roles.remove(role, 'AUTOMATED MATRIX: Premium Nitro Server Boost elapsed / expired cancellation.');
                    }

                    if (boostLogChannel) {
                        const unboostEmbed = new EmbedBuilder()
                            .setColor('#FF3333') // Alert Crimson
                            .setTitle(`${emoji.warning} Premium Asset Array: Server Boost Expired`)
                            .setDescription(`>>> ${newMember} has stopped boosting the server environment. Automated systems have reclaimed the designated rewards profile.`)
                            .addFields(
                                {
                                    name: `${emoji.member} __MEMBER FOOTPRINT__`,
                                    value: `* **User Account:** ${newMember.user} (${newMember.user.tag})\n* **Account ID:** \`${newMember.user.id}\``,
                                    inline: true
                                },
                                {
                                    name: `🚨 __DEPRIVATION STATUS__`,
                                    value: `* **Allocation:** Expired/Cancelled\n* **Stripped Role:** <@&${BOOST_ROLE_ID}>`,
                                    inline: true
                                }
                            )
                            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                            .setTimestamp();

                        await boostLogChannel.send({ embeds: [unboostEmbed] }).catch(() => null);
                    }
                }
            } catch (err) {
                console.error(`Failed to execute automated boost role reclamation:`, err);
            }
        }
    }
}
