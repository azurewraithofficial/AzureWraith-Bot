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
                    .setDescription('>>> You cannot kick yourself from the server.')
            ]
        });
    }

    if (!targetMember.kickable) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> I cannot kick this user. They have a higher role than me.')
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
                    .setDescription('>>> You cannot kick this user because their role is higher than or equal to yours.')
            ]
        });
    }

    // 3. Execution Phase
    try {
        // Send a direct message to the user before kicking them
        const dmEmbed = new EmbedBuilder()
            .setColor('#FF3333')
            .setTitle(`${emoji.warning} Server Kick Notice`)
            .setDescription(`>>> You have been kicked from the **${interaction.guild.name}** server.`)
            .addFields({ name: 'Reason', value: `\`\`\`\n${reason}\n\`\`\`` })
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            // DMs are closed, ignore and continue the kick
        });

        // Physically kick the user from the Discord server
        await targetMember.kick(`Kicked by: ${interaction.user.tag} | Reason: ${reason}`);

        // 4. Success Confirmation Embed
        const successEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.kick} Member Kicked Successfully`)
            .setDescription(`>>> The user has been removed from the server.`)
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
                    value: `${emoji.bell} **Notice:** This action has been completed and logged.`,
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
                    .setDescription(`>>> Failed to kick the member:\n\`\`\`js\n${error.message}\n\`\`\``)
            ]
        });
    }
}
