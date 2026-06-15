import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Displays the community rules and warning system layout.');

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        title: '<:Rules:1509557233007071375>',
        member: '<:Member:1509557217961967716>',
        sfw: '<:SFW:1509557212312371260>',
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        timeout: '<:Timeout:1509557597383168160>',
        kick: '<:PersonKick:1509557598691790968>',
        ban: '<:Ban:1509557236752580769>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        right: '<:ArrowRight:1509557249994129539>'
    };

    // Clean, minimalist embed builder function with heavy markdown formatting
    const generateEmbed = () => {
        return new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.title} Azure Wraith Server Protocol`)
            .setDescription(
                '>>> Welcome to the network directory. To maintain a safe, stable, and clean environment for everyone, all members must follow the guidelines detailed below. Failing to follow these steps will trigger automated or manual moderation actions.'
            )
            .addFields(
                {
                    name: `${emoji.member} __GENERAL CONDUCT__`,
                    value: 
                        `* **Be Respectful:** Treat everyone nicely. No bullying, hate speech, or mean comments allowed.\n` +
                        `* **Follow Staff:** Listen to instructions from team members. The staff team has the final say.\n` +
                        `* **No Drama:** Keep arguments, flame wars, and personal issues out of public text rooms.`,
                    inline: false
                },
                {
                    name: `${emoji.sfw} __CHAT & CONTENT RULES__`,
                    value: 
                        `* **Keep It Safe:** Do not post explicit files, graphic content, or unsafe material. Keep all discussions strictly **SFW**.\n` +
                        `* **No Spamming:** Do not flood chat channels with fast messages, huge blocks of text, or random tag walls.\n` +
                        `* **Use Right Channels:** Post topics where they belong (e.g. general chat in general, bot commands in bot rooms).`,
                    inline: false
                },
                {
                    name: `${emoji.warning} __THE WARNING SYSTEM__`,
                    value: 
                        `We use an escalation framework to keep our channels secure. Breaking rules updates your account record:\n\n` +
                        `\`[STAGE 01]\` ${emoji.mark} **Verbal Note:** A simple warning from a staff member to fix your behavior.\n` +
                        `\`[STAGE 02]\` ${emoji.timeout} **Mute / Timeout:** Your ability to type or speak will be locked temporarily.\n` +
                        `\`[STAGE 03]\` ${emoji.kick} **Server Kick:** You are removed from the server but can return if you get a new link.\n` +
                        `\`[STAGE 04]\` ${emoji.ban} **Permanent Ban:** Your account identity is banned from the network indefinitely.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** Moderation points can be given out automatically by our filtering logs or handled manually by server administrators. Please browse responsibly.`,
                    inline: false
                }
            )
            .setTimestamp();
    };

    await interaction.deferReply();

    // Component configuration panel layout
    const getButtons = (isDisabled = false) => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('refresh_rules')
            .setLabel('Refresh Panel')
            .setEmoji('1509557065713188874') // Refresh Emoji ID
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled),

        new ButtonBuilder()
            .setLabel('Discord Terms')
            .setURL('https://discord.com/terms')
            .setStyle(ButtonStyle.Link)
    );

    // Initial print phase
    const response = await interaction.editReply({
        embeds: [generateEmbed()],
        components: [getButtons(false)]
    });

    // Active interaction framework loop
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 45000
    });

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({
                content: 'This interface belongs to another administrator.',
                ephemeral: true
            });
        }

        if (btnInteraction.customId === 'refresh_rules') {
            const newStartTime = Date.now();

            // Transition clean loading view state
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`${emoji.title} Azure Wraith Server Protocol`)
                        .setDescription('*Refreshing database arrays and pulling fresh policy logs from directory...*')
                ],
                components: [getButtons(true)]
            });

            // Prevent rapid UI blinking 
            const dynamicDelay = Date.now() - newStartTime;
            if (dynamicDelay < 400) {
                await new Promise(resolve => setTimeout(resolve, 400 - dynamicDelay));
            }

            await interaction.editReply({
                embeds: [generateEmbed()],
                components: [getButtons(false)]
            });
        }
    });

    // Clean tracking window termination
    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [getButtons(true)] });
        } catch {
            // Safe exit route context loss
        }
    });
}
