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

    // 1. Safety Checks
    if (!targetMember) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> That user is not in this server.')
            ]
        });
    }

    if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> You cannot issue a warning to yourself.')
            ]
        });
    }

    if (targetUser.bot) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> Automated bot accounts cannot be added to the warning tracking system.')
            ]
        });
    }

    // 2. Role Hierarchy Check
    const executorHighestRole = interaction.member.roles.highest.position;
    const targetHighestRole = targetMember.roles.highest.position;

    if (executorHighestRole <= targetHighestRole && interaction.guild.ownerId !== interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> You cannot warn this user because their role is higher than or equal to yours.')
            ]
        });
    }

    // 3. Execution Phase
    try {
        // Send a direct message warning to the member
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF3333')
            .setTitle(`${emoji.warning} Official Server Warning`)
            .setDescription(`>>> You have received a formal warning in the **${interaction.guild.name}** server. Please review our community rules to avoid further penalties.`)
            .addFields({ name: 'Reason for Warning', value: `\`\`\`\n${reason}\n\`\`\`` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            // DMs are closed, ignore and continue to print the staff log
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
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} System Error`)
                    .setDescription(`>>> Failed to issue the warning process:\n\`\`\`js\n${error.message}\n\`\`\``)
            ]
        });
    }
}
