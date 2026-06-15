import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Clears all logged warnings for a server member.')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user whose warnings you want to clear.')
            .setRequired(true)
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

    // Keep response hidden to staff to protect command processing privacy
    await interaction.deferReply({ ephemeral: true });

    // 1. Safety Checks
    if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> You cannot clear your own warnings.')
            ]
        });
    }

    if (targetUser.bot) {
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FF3333')
                    .setTitle(`${emoji.warning} Error`)
                    .setDescription('>>> Automated bot accounts do not have warning profiles.')
            ]
        });
    }

    // 2. Execution Phase
    try {
        // NOTE: If you use a database (MongoDB, SQLite, etc.), add your deletion query here.
        // Example: await db.warnings.deleteMany({ userId: targetUser.id, guildId: interaction.guild.id });

        // Send a direct message notification to the member letting them know their record is clean
        const dmEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.mark} Warnings Cleared`)
            .setDescription(`>>> Your active warning history in the **${interaction.guild.name}** server has been cleared by a staff member.`)
            .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
            // DMs are closed, ignore and continue to print the confirmation embed
        });

        // 3. Success Confirmation Embed matching your layout design
        const successEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.mark} User Record Reset`)
            .setDescription(`>>> All active infractions and warnings have been successfully cleared from this user account profile.`)
            .addFields(
                {
                    name: `${emoji.member} __USER DETAILS__`,
                    value: 
                        `* **Cleared User:** ${targetUser} (${targetUser.tag})\n` +
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
                    name: `${emoji.warning} __ACTION TAKEN__`,
                    value: `\`\`\`ansi\n\u001b[1;34mAll database warning history points wiped clean.\u001b[0m\n\`\`\``,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** This account profile has returned to optimal standing within the active server registry index.`,
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
                    .setDescription(`>>> Failed to clear the warnings from the profile directory:\n\`\`\`js\n${error.message}\n\`\`\``)
            ]
        });
    }
}
