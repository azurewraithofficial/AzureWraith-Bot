import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the Discord server.')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user you want to kick from the server.')
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('reason')
            .setDescription('The reason for kicking this member.')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        kick: '<:PersonKick:1509557598691790968>',
        warning: '<:Warning:1509557251181117500>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        mark: '<:Mark:1509557248534253568>'
    };

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    // Keep response hidden to staff to protect command processing privacy
    await interaction.deferReply({ ephemeral: true });

    // ────────────────────────────────────────────────────────────────────────
    // 1. SAFETY INFRASTRUCTURE VALIDATION CHECKS
    // ────────────────────────────────────────────────────────────────────────

    // Check A: Target user is not present in the server guild
    if (!targetMember) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333') // Alert Crimson
                    .setTitle(`${emoji.warning} Command Execution Failure`)
                    .setDescription(`>>> **Target Null:** The selected user profile cannot be processed because they are not an active member of this server registry space.`)
                    .addFields({ 
                        name: '───────────────', 
                        value: `${emoji.bell} **Resolution:** Please verify the snowflake ID or handle string entry before attempting to retry the execution block.`, 
                        inline: false 
                    })
            ]
        });
    }

    // Check B: Executor attempting to kick their own personal account
    if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Command Execution Failure`)
                    .setDescription(`>>> **Self-Target Lock:** You are attempting to execute an eviction loop on your own personal profile account.`)
                    .addFields({ 
                        name: '───────────────', 
                        value: `${emoji.bell} **Resolution:** Self-eviction procedures are restricted by the system core. Please isolate an external target member.`, 
                        inline: false 
                    })
            ]
        });
    }

    // Check C: Application bot clearance height check (Discord client hierarchy restriction)
    if (!targetMember.kickable) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} System Privilege Restriction`)
                    .setDescription(`>>> **Bot Clearance Limit:** The application integration lacks the required role hierarchy clearance height to forcefully eject this user profile.`)
                    .addFields({ 
                        name: '───────────────', 
                        value: `${emoji.bell} **Resolution:** Adjust server core settings to reposition the bot integration role layer strictly above the target member's highest assigned role.`, 
                        inline: false 
                    })
            ]
        });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. ROLE HIERARCHY PROTECTION GATE
    // ────────────────────────────────────────────────────────────────────────
    const executorHighestRole = interaction.member.roles.highest.position;
    const targetHighestRole = targetMember.roles.highest.position;

    if (executorHighestRole <= targetHighestRole && interaction.guild.ownerId !== interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Hierarchy Privilege Violation`)
                    .setDescription(`>>> **Access Denied:** Your administrative role clearance rank is insufficient to deploy tracking vectors or execution modifiers to this server user.`)
                    .addFields(
                        { 
                            name: `${emoji.staff} __YOUR SYSTEM POSITION__`, 
                            value: `* **Highest Role Rank:** \`Level ${executorHighestRole}\``, 
                            inline: true 
                        },
                        { 
                            name: `${emoji.kick} __TARGET SYSTEM POSITION__`, 
                            value: `* **Highest Role Rank:** \`Level ${targetHighestRole}\``, 
                            inline: true 
                        },
                        { 
                            name: '───────────────', 
                            value: `${emoji.bell} **Notice:** You can only issue disciplinary actions to member accounts positioned strictly below your highest role layer assignment.`, 
                            inline: false 
                        }
                    )
            ]
        });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 3. EXECUTION DISPATCH MATRIX
    // ────────────────────────────────────────────────────────────────────────
    try {
        // Send a secure direct message notification to the user before expulsion
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF3333')
            .setTitle(`${emoji.warning} Server Kick Notice`)
            .setDescription(`>>> You have been kicked from the **${interaction.guild.name}** server environment.`)
            .addFields({ name: 'Reason for Removal', value: `\`\`\`\n${reason}\n\`\`\`` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            // DMs are locked or blocked, suppress error cascade and log data directly
        });

        // Physically eject the member from the Discord server registry guild
        await targetMember.kick(`Kicked by: ${interaction.user.tag} | Reason: ${reason}`);

        // 4. Success Confirmation Embed matching your layout design
        const successEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.kick} Member Kicked Successfully`)
            .setDescription(`>>> The user account profile has been successfully processed and severed from the server registry.`)
            .addFields(
                {
                    name: `${emoji.mark} __USER DETAILS__`,
                    value: 
                        `* **Kicked User:** ${targetUser} (${targetUser.tag})\n` +
                        `* **User ID:** \`${targetUser.id}\``,
                    inline: false
                },
                {
                    name: `${emoji.staff} __MODERATOR__`,
                    value: 
                        `* **Staff Member:** ${interaction.user}\n` +
                        `* **Staff ID:** \`${interaction.user.id}\``,
                    inline: false
                },
                {
                    name: `${emoji.warning} __REASON__`,
                    value: `\`\`\`ansi\n\u001b[1;31m${reason}\u001b[0m\n\`\`\``,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** This action has been completed and written into the server log databases.`,
                    inline: false
                }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
        // 5. System runtime exception safety block
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Runtime Exception Detected`)
                    .setDescription(`>>> The application layer core encountered an unhandled processing exception while attempting to build the moderation data packet.`)
                    .addFields(
                        { 
                            name: '__UNHANDLED TRACE EXCEPTION__', 
                            value: `\`\`\`js\n${error.message}\n\`\`\``, 
                            inline: false 
                        },
                        { 
                            name: '───────────────', 
                            value: `${emoji.bell} **Notice:** If this internal exception block persists across multiple deployment cycles, route the trace report logs to system development.`, 
                            inline: false 
                        }
                    )
            ]
        });
    }
}
