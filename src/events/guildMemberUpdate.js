import { EmbedBuilder } from 'discord.js';

export const name = 'guildMemberUpdate';

export async function execute(oldMember, newMember) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
    };

    const BOOST_ROLE_ID = '1508528048851517562';
    const guild = newMember.guild;

    // Detect if the user started boosting or stopped boosting
    const startedBoosting = !oldMember.premiumSince && newMember.premiumSince;
    const stoppedBoosting = oldMember.premiumSince && !newMember.premiumSince;

    if (!startedBoosting && !stoppedBoosting) return;

    // Isolate logging channel pipeline for telemetry visibility
    const logChannel = guild.channels.cache.find(c => c.name.includes('security') || c.name.includes('mod') || c.name.includes('log'));

    // ────────────────────────────────────────────────────────────────────────
    // CYCLE A: NEW BOOST DETECTED -> ASSIGN ROLE
    // ────────────────────────────────────────────────────────────────────────
    if (startedBoosting) {
        try {
            const role = await guild.roles.fetch(BOOST_ROLE_ID).catch(() => null);
            if (!role) return console.error(`[Boost Error] Target Role ID ${BOOST_ROLE_ID} not found in guild registry.`);

            // Inject premium role to target member profile
            await newMember.roles.add(role, 'AUTOMATED MATRIX: Premium Nitro Server Boost rewards allocation.');

            if (logChannel) {
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

                await logChannel.send({ embeds: [boostEmbed] });
            }
        } catch (err) {
            console.error(`Failed to execute automated boost role assignment:`, err);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // CYCLE B: BOOST EXPIRED / REMOVED -> STRIP ROLE
    // ────────────────────────────────────────────────────────────────────────
    if (stoppedBoosting) {
        try {
            const role = await guild.roles.fetch(BOOST_ROLE_ID).catch(() => null);
            if (!role) return;

            // Strip premium role from target member profile if they possess it
            if (newMember.roles.cache.has(BOOST_ROLE_ID)) {
                await newMember.roles.remove(role, 'AUTOMATED MATRIX: Premium Nitro Server Boost elapsed / expired cancellation.');
            }

            if (logChannel) {
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

                await logChannel.send({ embeds: [unboostEmbed] });
            }
        } catch (err) {
            console.error(`Failed to execute automated boost role reclamation:`, err);
        }
    }
}
