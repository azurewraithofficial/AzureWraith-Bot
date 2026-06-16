import { EmbedBuilder, GuildVerificationLevel } from 'discord.js';

// Instantiate localized rolling window memory maps
const joinTracker = new Map();
let lockdownActive = false;

export const name = 'guildMemberAdd';

export async function execute(member) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        bell: '<:Bell:1509557209363775638>'
    };

    // Pull configurations safely from global scope or default down
    const config = global.securityConfig || { antiRaid: true, joinThreshold: 8 };
    if (!config.antiRaid) return;

    const guildId = member.guild.id;
    const now = Date.now();

    if (!joinTracker.has(guildId)) {
        joinTracker.set(guildId, []);
    }

    const timestamps = joinTracker.get(guildId);
    // Filter out timestamps outside of our rolling 10-second inspection array
    const validTimestamps = timestamps.filter(time => now - time < 10000);
    
    validTimestamps.push(now);
    joinTracker.set(guildId, validTimestamps);

    // Velocity validation breaker check
    if (validTimestamps.length > config.joinThreshold && !lockdownActive) {
        lockdownActive = true;

        try {
            // Trigger emergency protocol: Elevate server verification requirements to highest level
            await member.guild.setVerificationLevel(GuildVerificationLevel.VeryHigh, 'SECURITY EMERGENCY: Anti-Raid Threshold Tripped.');

            // Isolate system alert logging channel (Finds a target logging or chat channel)
            const alertChannel = member.guild.channels.cache.find(c => c.name.includes('security') || c.name.includes('mod') || c.name.includes('log'));
            
            if (alertChannel) {
                const emergencyEmbed = new EmbedBuilder()
                    .setColor('#FF3333') // Alert Crimson
                    .setTitle(`${emoji.warning} SECURITY MATRIX: Automated Perimeter Lockdown Activated`)
                    .setDescription(`>>> **Join Velocity Tripped:** The automated gateway intercepted an unnatural spike in user connections. Mass deployment vector quarantined successfully.`)
                    .addFields(
                        { 
                            name: '__TELEMETRY DATA__', 
                            value: `* **Spike Metrix:** \`${validTimestamps.length} connections detected inside 10 seconds.\`\n* **Countermeasure:** Verification profile adjusted to \`Highest (Verified Phone Required)\``, 
                            inline: false 
                        },
                        { 
                            name: '───────────────', 
                            value: `${emoji.bell} **Resolution:** Staff must manually investigate the account profiles. Use administration parameters to normalize security verification heights once cleared.`, 
                            inline: false 
                        }
                    )
                    .setTimestamp();

                await alertChannel.send({ embeds: [emergencyEmbed] });
            }
        } catch (err) {
            console.error('Failed to update anti-raid lockdown parameters:', err);
        }

        // Cool-down cycle resetting tracking mechanics after 5 minutes
        setTimeout(async () => {
            lockdownActive = false;
        }, 300000);
    }
}
