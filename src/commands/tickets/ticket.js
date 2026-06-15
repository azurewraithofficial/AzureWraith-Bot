import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType, 
    PermissionFlagsBits, 
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    AttachmentBuilder
} from 'discord.js';

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
        warning: '<:Warning:1509557251181117500>',
        timeout: '<:Timeout:1509557597383168160>'
    };

    const TRANSCRIPT_CHANNEL_ID = '1508526671333036193';
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'panel') {
        // Main channel greeting layout
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

        const getPanelButtons = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_support_ticket')
                .setLabel('Open Support Ticket')
                .setEmoji('1509557210861142186')
                .setStyle(ButtonStyle.Primary)
        );

        // Print standalone main screen
        const response = await interaction.channel.send({
            embeds: [generatePanelEmbed()],
            components: [getPanelButtons()]
        });

        await interaction.reply({
            content: 'The support ticket interface panel has been deployed below.',
            ephemeral: true
        });

        const panelCollector = response.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'create_support_ticket') {
                await btnInteraction.deferReply({ ephemeral: true });

                const guild = btnInteraction.guild;
                const user = btnInteraction.user;

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
                    // Create private support channel node
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

                    // Inside-channel control panel options setup
                    const ticketControlEmbed = new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`${emoji.staff} Support Ticket Active`)
                        .setDescription(`Welcome to your private support room, ${user}. The moderation team has been notified.\n\nStaff can utilize the management command grid below to route this request.`)
                        .addFields(
                            { name: `${emoji.member} __TICKET OWNER__`, value: `* **User:** ${user}\n* **Account ID:** \`${user.id}\``, inline: true },
                            { name: `${emoji.staff} __ASSIGNED STAFF__`, value: `* **Status:** Unclaimed / Pending Assistance`, inline: true }
                        )
                        .setTimestamp();

                    const row1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim Ticket').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('unclaim_ticket').setLabel('Unclaim Ticket').setStyle(ButtonStyle.Secondary)
                    );

                    const row2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('close_reason_ticket').setLabel('Close With Reason').setStyle(ButtonStyle.Danger)
                    );

                    const controlMessage = await ticketChannel.send({
                        content: `${user} | Staff Notification Matrix`,
                        embeds: [ticketControlEmbed],
                        components: [row1, row2]
                    });

                    // Acknowledge the user link connection
                    await btnInteraction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} Ticket Created`)
                                .setDescription(`>>> Your secure communication line has been established successfully at ${ticketChannel}.`)
                        ]
                    });

                    // ─── LOCAL TICKETING SYSTEM MANAGEMENT MATRIX ───
                    const channelCollector = controlMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button
                    });

                    channelCollector.on('collect', async (ticketBtnInteraction) => {
                        const isStaff = ticketBtnInteraction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
                        const actionId = ticketBtnInteraction.customId;

                        // Authorization guard rails
                        if (!isStaff && ['claim_ticket', 'unclaim_ticket', 'close_reason_ticket'].includes(actionId)) {
                            return ticketBtnInteraction.reply({
                                content: 'This operations vector is strictly restricted to authorized server staff members.',
                                ephemeral: true
                            });
                        }

                        // 1. CLAIM PROTOCOL
                        if (actionId === 'claim_ticket') {
                            const updatedEmbed = EmbedBuilder.from(controlMessage.embeds[0])
                                .setFields(
                                    { name: `${emoji.member} __TICKET OWNER__`, value: `* **User:** ${user}\n* **Account ID:** \`${user.id}\``, inline: true },
                                    { name: `${emoji.staff} __ASSIGNED STAFF__`, value: `* **Status:** Claimed by ${ticketBtnInteraction.user}`, inline: true }
                                );

                            await ticketBtnInteraction.update({ embeds: [updatedEmbed] });
                            await ticketChannel.send({ content: `${emoji.mark} This ticket is now being handled by ${ticketBtnInteraction.user}.` });
                        }

                        // 2. UNCLAIM PROTOCOL
                        if (actionId === 'unclaim_ticket') {
                            const updatedEmbed = EmbedBuilder.from(controlMessage.embeds[0])
                                .setFields(
                                    { name: `${emoji.member} __TICKET OWNER__`, value: `* **User:** ${user}\n* **Account ID:** \`${user.id}\``, inline: true },
                                    { name: `${emoji.staff} __ASSIGNED STAFF__`, value: `* **Status:** Unclaimed / Pending Assistance`, inline: true }
                                );

                            await ticketBtnInteraction.update({ embeds: [updatedEmbed] });
                            await ticketChannel.send({ content: `${emoji.timeout} The staff assignment has been removed. This ticket is back in the open queue.` });
                        }

                        // 3. CLOSE TICKET (Standard)
                        if (actionId === 'close_ticket') {
                            await ticketBtnInteraction.reply({ content: `${emoji.warning} Closure protocol initialized. Archiving logs and preparing room deletion...` });
                            await processTicketArchival(ticketChannel, ticketBtnInteraction.user, 'No closure rationale specified.', guild, user, emoji, TRANSCRIPT_CHANNEL_ID);
                        }

                        // 4. CLOSE WITH REASON (Staff Modal Input Box)
                        if (actionId === 'close_reason_ticket') {
                            const modal = new ModalBuilder()
                                .setCustomId('ticket_close_modal')
                                .setTitle('Close Support Ticket');

                            const reasonInput = new TextInputBuilder()
                                .setCustomId('ticket_close_reason')
                                .setLabel('Reason for closing this ticket?')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                                .setPlaceholder('Type your official support resolution summary here...');

                            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                            await ticketBtnInteraction.showModal(modal);

                            // Capture input submission from user interface
                            const modalSubmit = await ticketBtnInteraction.awaitModalSubmit({
                                filter: i => i.customId === 'ticket_close_modal',
                                time: 60000
                            }).catch(() => null);

                            if (modalSubmit) {
                                const formalReason = modalSubmit.fields.getTextInputValue('ticket_close_reason');
                                await modalSubmit.reply({ content: `${emoji.warning} Termination sequence locked. Compiling history index log...` });
                                await processTicketArchival(ticketChannel, ticketBtnInteraction.user, formalReason, guild, user, emoji, TRANSCRIPT_CHANNEL_ID);
                            }
                        }
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

// ─── DATA COMPILATION AND TRANSCRIPT PACKAGING ENGINE ───
async function processTicketArchival(channel, executor, reason, guild, owner, emoji, logChannelId) {
    try {
        // Fetch up to 100 historical message strings from the channel registry
        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
        let transcriptString = `==================================================\n`;
        transcriptString += `AZURE WRAITH NETWORK TICKET TRANSCRIPT LOG\n`;
        transcriptString += `Channel Identifier: ${channel.name}\n`;
        transcriptString += `Account Owner: ${owner.tag} (${owner.id})\n`;
        transcriptString += `Closed Executed By: ${executor.tag} (${executor.id})\n`;
        transcriptString += `Closure Reason Given: ${reason}\n`;
        transcriptString += `==================================================\n\n`;

        fetchedMessages.reverse().forEach(msg => {
            const timestamp = msg.createdAt.toISOString().replace('T', ' ').substring(0, 19);
            transcriptString += `[${timestamp}] ${msg.author.tag}: ${msg.content}\n`;
        });

        // Convert data into a physical storage document payload attachment
        const textBuffer = Buffer.from(transcriptString, 'utf-8');
        const fileAttachment = new AttachmentBuilder(textBuffer, { name: `transcript-${channel.name}.txt` });

        // Construct log file delivery print
        const archiveEmbed = new EmbedBuilder()
            .setColor('#007FFF')
            .setTitle(`${emoji.staff} Ticket Archive Logged`)
            .setDescription(`>>> A private text room channel has been closed and fully logged inside the data registers.`)
            .addFields(
                { name: `${emoji.member} __TICKET ATTRIBUTES__`, value: `* **Channel Name:** \`${channel.name}\`\n* **Opened By:** ${owner} (\`${owner.id}\`)`, inline: false },
                { name: `${emoji.staff} __CLOSURE OPERATION__`, value: `* **Operator:** ${executor} (\`${executor.id}\`)\n* **Reason Matrix:** \`${reason}\``, inline: false }
            )
            .setTimestamp();

        const logDestination = await guild.channels.fetch(logChannelId).catch(() => null);
        if (logDestination) {
            await logDestination.send({ embeds: [archiveEmbed], files: [fileAttachment] });
        }

        // Delay 5 seconds to prevent memory leaks before running full deletion cascade
        await new Promise(resolve => setTimeout(resolve, 5000));
        await channel.delete().catch(() => null);

    } catch (err) {
        await channel.send({ content: `Critical tracking error failed to export historical text transcripts: ${err.message}` }).catch(() => null);
    }
}
