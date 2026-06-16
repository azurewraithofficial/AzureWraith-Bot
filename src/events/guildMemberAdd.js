import { EmbedBuilder, GuildVerificationLevel } from 'discord.js';

const joinTracker = new Map();
let lockdownActive = false;

export const name = 'guildMemberAdd';

export async function execute(member) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>',
        mark: '<:Mark:1509557248534253568>'
    };

    const guildId = member.guild.id;
    const now = Date.now();

    // ────────────────────────────────────────────────────────────────────────
    // PHASE A: ANTI-RAID VELOCITY MONITORING CORE
    // ────────────────────────────────────────────────────────────────────────
    const securityConfig = global.securityConfig || { antiRaid: true, joinThreshold: 8 };
    
    if (securityConfig.antiRaid) {
        if (!joinTracker.has(guildId)) {
            joinTracker.set(guildId, []);
        }

        const timestamps = joinTracker.get(guildId);
        const validTimestamps = timestamps.filter(time => now - time < 10000);
        
        validTimestamps.push(now);
        joinTracker.set(guildId, validTimestamps);

        if (validTimestamps.length > securityConfig.joinThreshold && !lockdownActive) {
            lockdownActive = true;

            try {
                await member.guild.setVerificationLevel(GuildVerificationLevel.VeryHigh, 'SECURITY EMERGENCY: Anti-Raid Threshold Tripped.');
                const alertChannel = member.guild.channels.cache.find(c => c.name.includes('security') || c.name.includes('mod') || c.name.includes('log'));
                
                if (alertChannel) {
                    const emergencyEmbed = new EmbedBuilder()
                        .setColor('#FF3333')
                        .setTitle(`${emoji.warning} SECURITY MATRIX: Automated Perimeter Lockdown Activated`)
                        .setDescription(`>>> **Join Velocity Tripped:** The automated gateway intercepted an unnatural spike in user connections. Mass deployment vector quarantined successfully.`)
                        .addFields({ 
                            name: '__TELEMETRY DATA__', 
                            value: `* **Spike Metrix:** \`${validTimestamps.length} connections inside 10 seconds.\`\n* **Countermeasure:** Verification profile adjusted to \`Highest (Verified Phone Required)\``, 
                            inline: false 
                        })
                        .setTimestamp();

                    await alertChannel.send({ embeds: [emergencyEmbed] });
                }
            } catch (err) {
                console.error('Failed to execute anti-raid security protocols:', err);
            }

            setTimeout(() => { lockdownActive = false; }, 300000);
        }
    }

    // If an active network raid lockdown is ongoing, stall further presentation logic
    if (lockdownActive) return;

    // ────────────────────────────────────────────────────────────────────────
    // PHASE B: AUTOMATED WELCOME ENGINE INTERFACE
    // ────────────────────────────────────────────────────────────────────────
    const welcomeConfig = global.welcomeConfig || { enabled: false, channelId: null };
    
    if (welcomeConfig.enabled && welcomeConfig.channelId) {
        const welcomeChannel = member.guild.channels.cache.get(welcomeConfig.channelId);
        
        if (welcomeChannel) {
            // Format precise Discord timestamp tags for high-end account age tracking data
            const accountCreationTimestamp = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;
            const totalServerMembers = member.guild.memberCount;

            const cardEmbed = new EmbedBuilder()
                .setColor('#007FFF') // True Azure Blue
                .setTitle(`${emoji.member} Parameter Identity Logged: New Connection Established`)
                .setDescription(`>>> Welcome to the **${member.guild.name}** server environment, ${member}! Our core defensive matrix has successfully parsed and assigned your local permission tags.`)
                .addFields(
                    {
                        name: `${emoji.mark} __USER PROFILE DATA__`,
                        value: 
                            `* **Global Tag Name:** ${member.user.tag}\n` +
                            `* **Snowflake ID Entry:** \`${member.user.id}\`\n` +
                            `* **Account Registry Created:** ${accountCreationTimestamp}`,
                        inline: false
                    },
                    {
                        name: `${emoji.bell} __CORE RESPONSIBILITIES__`,
                        value: 
                            `* Please review all listed operational guidelines to preserve server structural health.\n` +
                            `* Secure your account roles and coordinate with sector admins if configuring assets.`,
                        inline: false
                    },
                    {
                        name: '───────────────',
                        value: `✨ **Network Registry Density:** You are our assigned member profile layer: **#${totalServerMembers}**`,
                        inline: false
                    }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setTimestamp();

            await welcomeChannel.send({ content: `${member}`, embeds: [cardEmbed] }).catch(() => {
                // Fail-safe wrapper to handle cases where channel write privileges are modified externally
            });
        }
    }
}
