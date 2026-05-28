import { SlashCommandBuilder } from 'discord.js';
import prisma from '../../db.js';

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your community profile stats!');

export async function execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
        let profile = await prisma.userProfile.findUnique({
            where: { userId: userId }
        });

        if (!profile) {
            profile = await prisma.userProfile.create({
                data: { userId, guildId, xp: 10, level: 1 }
            });
            return await interaction.editReply(`👋 Welcome to Azure Wraith! I've created your database profile. You currently have **${profile.xp} XP**.`);
        }

        profile = await prisma.userProfile.update({
            where: { userId: userId },
            data: { xp: profile.xp + 5 }
        });

        await interaction.editReply(`📊 **${interaction.user.username}'s Profile:**\n• **Level:** ${profile.level}\n• **Total XP:** ${profile.xp} _(+5 gained via command)_`);
        
    } catch (error) {
        console.error('Database Error:', error);
        await interaction.editReply('❌ Failed to communicate with the database.');
    }
}
