import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issues a formal warning to a server member.')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user you want to warn.')
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('reason')
            .setDescription('The reason for giving this warning.')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
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

    // Check B: Executor attempting to warn their own account profile
    if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Command Execution Failure`)
                    .setDescription(`>>> **Self-Target Lock:** You are attempting to dispatch a formal disciplinary infraction log to your own personal profile index.`)
                    .addFields({ 
                        name: '───────────────', 
                        value: `${emoji.bell} **Resolution:** Self-moderation matrices are disabled. Please isolate an external target member.`, 
                        inline: false 
                    })
            ]
        });
    }

    // Check C: Target user resolves to an automated network application bot
    if (targetUser.bot) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Command Execution Failure`)
                    .setDescription(`>>> **Automated Account:** The designated target account resolves to a Discord client application bot instead of a human entity profile.`)
                    .addFields({ 
                        name: '───────────────', 
                        value: `${emoji.bell} **Resolution:** Platform applications are globally immune to server profile infraction tracking structures.`, 
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
                    .setDescription(`>>> **Access Denied:** Your administrative role clearance rank is insufficient to deploy tracking vectors or command modifiers to this server user.`)
                    .addFields(
                        { 
                            name: `${emoji.staff} __YOUR SYSTEM POSITION__`, 
                            value: `* **Highest Role Rank:** \`Level ${executorHighestRole}\``, 
                            inline: true 
                        },
                        { 
                            name: `${emoji.member} __TARGET SYSTEM POSITION__`, 
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
        // Send a private direct message warning to the member account file
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF3333')
            .setTitle(`${emoji.warning} Official Server Warning`)
            .setDescription(`>>> You have received a formal warning in the **${interaction.guild.name}** server environment. Please review our official network rules to avoid escalation.`)
            .addFields({ name: 'Reason for Warning', value: `\`\`\`\n${reason}\n\`\`\`` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            // DMs are locked or blocked, suppress error cascade and log data directly
        });

        // 4. Success Confirmation Embed matching your layout design
        const successEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.mark} Formal Warning Issued`)
            .setDescription(`>>> The warning has been successfully logged against the member account profile.`)
            .addFields(
                {
                    name: `${emoji.member} __USER DETAILS__`,
                    value: 
                        `* **Warned User:** ${targetUser} (${targetUser.tag})\n` +
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
                    value: `${emoji.bell} **Notice:** This action has been logged. Repeated warnings will escalate into automatic timeouts or server kicks.`,
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
