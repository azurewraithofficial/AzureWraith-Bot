import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket management system infrastructure.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the interactive support ticket creation panel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        staff: '<:Staff:1509557210861142186>',
        member: '<:Member:1509557217961967716>',
        mark: '<:Mark:1509557248534253568>',
        bell: '<:Bell:1509557209363775638>',
        warning: '<:Warning:1509557251181117500>'
    };

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'panel') {
        // Clean, minimalist panel embed builder function
        const generatePanelEmbed = () => {
            return new EmbedBuilder()
                .setColor('#007FFF') // True Azure Blue
                .setTitle(`${emoji.staff} Azure Wraith Support Center`)
                .setDescription(
                    '>>> Need assistance, want to report a user, or have a general question? Open a private communication ticket with our server staff team using the portal options below.'
                )
                .addFields(
                    {
                        name: `${emoji.member} __BEFORE YOU OPEN A TICKET__`,
                        value: 
                            `* Make sure your question isn't already answered in our rules or information channels.\n` +
                            `* Please be ready to explain your issue clearly with descriptions or screenshot links if needed.\n` +
                            `* Do not open multiple tickets at the same time for the exact same issue.`,
                        inline: false
                    },
                    {
                        name: `${emoji.bell} __PRIVACY & POLICY__`,
                        value: 
                            `* Once you press the button, a brand new private text channel will be built just for you.\n` +
                            `* Only you and active members of the server staff team will have access to see or type inside it.\n` +
                            `* Troll tickets, spam creation, or advertising inside support chats will result in a server warning.`,
                        inline: false
                    },
                    {
                        name: '───────────────',
                        value: `${emoji.mark} **Click the button below to initialize your support request channel.**`,
                        inline: false
                    }
                )
                .setTimestamp();
        };

        // Create the interactive button to trigger ticket creation
        const getPanelButtons = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_support_ticket')
                .setLabel('Open Support Ticket')
                .setEmoji('1509557210861142186') // Staff Emoji ID
                .setStyle(ButtonStyle.Primary)
        );

        // Deploy directly as a standalone message inside the channel
        const response = await interaction.channel.send({
            embeds: [generatePanelEmbed()],
            components: [getPanelButtons()]
        });

        // Send a hidden confirmation to the administrator who ran the command
        await interaction.reply({
            content: 'The support ticket interface panel has been deployed below.',
            ephemeral: true
        });

        // High-duration message component collector to listen for member clicks
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 86400000 // Active for 24 hours (Note: For absolute permanence across bot reboots, handle this in index.js)
        });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'create_support_ticket') {
                await btnInteraction.deferReply({ ephemeral: true });

                const guild = btnInteraction.guild;
                const user = btnInteraction.user;

                // Check if a ticket channel already exists for this user to prevent spam
                const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
                if (existingChannel) {
                    return btnInteraction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#FF3333')
                                .setTitle(`${emoji.warning} Request Denied`)
                                .setDescription(`>>> You already have an active support channel open. Please head over to ${existingChannel} to talk with staff.`)
                        ]
                    });
                }

                try {
                    // Create the private text channel matching structural requirements
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: user.id,
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ReadMessageHistory,
                                    PermissionFlagsBits.AttachFiles
                                ]
                            }
                        ]
                    });

                    // Construct the internal ticket channel introduction screen
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#007FFF') // True Azure Blue
                        .setTitle(`${emoji.staff} Support Ticket Initialized`)
                        .setDescription(`Welcome to your private support room, ${user}. The moderation team has been notified.`)
                        .addFields(
                            {
                                name: `${emoji.member} __INSTRUCTIONS__`,
                                value: 'Please state your question or problem clearly right here. Include any details or media links that might help us resolve it faster.',
                                inline: false
                            },
                            {
                                name: `${emoji.warning} __CLOSING THE TICKET__`,
                                value: 'When your support request is finished and completely resolved, a staff member will archive and close this channel.',
                                inline: false
                            }
                        )
                        .setTimestamp();

                    // Send the message into the newly constructed channel
                    await ticketChannel.send({
                        content: `${user} | Staff Notification`,
                        embeds: [welcomeEmbed]
                    });

                    // Update the user's interaction panel button with a direct link success status
                    await btnInteraction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} Ticket Created`)
                                .setDescription(`>>> Your secure communication line has been established successfully at ${ticketChannel}.`)
                        ]
                    });

                } catch (error) {
                    return btnInteraction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#FF3333')
                                .setTitle(`${emoji.warning} System Error`)
                                .setDescription(`>>> Encountered an error while attempting to forge your support channel:\n\`\`\`js\n${error.message}\n\`\`\``)
                        ]
                    });
                }
            }
        });
    }
}
