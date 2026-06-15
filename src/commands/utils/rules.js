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
                '>>> Welcome to the community directory. To maintain a safe, stable, and welcoming environment for everyone, all members must follow the comprehensive guidelines detailed below. Violating these directives will result in moderation tracking.'
            )
            .addFields(
                {
                    name: `${emoji.member} __GENERAL CONDUCT__`,
                    value: 
                        `* **Be Respectful:** Treat all community members with courtesy. Bullying, harassment, toxic behavior, insults, and hate speech are strictly prohibited.\n` +
                        `* **Follow Staff Directions:** Listen to instructions given by the moderation team. Staff decisions are final and must be respected.\n` +
                        `* **No Drama or Fighting:** Keep personal arguments, flame wars, and dramatic call-outs completely out of public text rooms.\n` +
                        `* **No Impersonation:** Do not copy the profile pictures, names, or statuses of staff members, other creators, or automated system bots.\n` +
                        `* **No Mini-Modding:** Do not try to enforce rules or threaten punishments yourself. Tag an active staff member if you see an issue.`,
                    inline: false
                },
                {
                    name: `${emoji.sfw} __CHAT & CONTENT GUIDELINES__`,
                    value: 
                        `* **Keep Content Safe:** Do not post explicit images, gore, graphic content, or unsafe files. Keep conversations strictly **SFW**.\n` +
                        `* **No Spamming:** Do not flood chat boxes with rapid messages, massive text blocks, copy-pastes, or random mention tag walls.\n` +
                        `* **Use Assigned Channels:** Keep topics where they belong. Use designated rooms for bot interactions, gaming, and off-topic media.\n` +
                        `* **No Self-Promotion:** Do not share server invites, personal links, streams, or DM advertisements without explicit admin approval.\n` +
                        `* **No Rule Loopholes:** Do not look for clever ways to bypass filters or exploit rule wording. Follow the clear spirit of these guidelines.`,
                    inline: false
                },
                {
                    name: `${emoji.warning} __THE WARNING SYSTEM__`,
                    value: 
                        `We use a progressive enforcement tracking layout to keep our channels secure. Breaking rules will update your moderation record as follows:\n\n` +
                        `* ${emoji.mark} **Formal Warning:** A recorded notification from a staff member to fix your behavior immediately.\n` +
                        `* ${emoji.timeout} **Account Timeout:** Your ability to type in text channels or speak in voice areas will be locked temporarily.\n` +
                        `* ${emoji.kick} **Server Kick:** You will be removed from the server directory, but you can rejoin if you hold a valid invite link.\n` +
                        `* ${emoji.ban} **Permanent Ban:** Your account identity is banned from the server indefinitely with no standard return path.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** Serious rules offenses can bypass the standard progression entirely, resulting in immediate kicks or bans depending on administrator review.`,
                    inline: false
                }
            )
            .setTimestamp();
    };

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

    // Deploy directly as a standalone channel message rather than an interaction reply anchor
    const response = await interaction.channel.send({
        embeds: [generateEmbed()],
        components: [getButtons(false)]
    });

    // Provide a hidden ephemeral confirmation response so the slash command closes successfully
    await interaction.reply({
        content: 'The community guidelines panel has been deployed below.',
        ephemeral: true
    });

    // Active interaction framework loop tied directly to the standalone channel message response
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

            // Transition clean loading view state on the current button interaction
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

            // Edit the standalone message directly using the interaction's editReply vector
            await btnInteraction.editReply({
                embeds: [generateEmbed()],
                components: [getButtons(false)]
            });
        }
    });

    // Clean tracking window termination
    collector.on('end', async () => {
        try {
            await response.edit({ components: [getButtons(true)] });
        } catch {
            // Safe exit route context loss
        }
    });
}
