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
    .addSubcommand(subcommand =>
        subcommand
            .setName('dashboard')
            .setDescription('Opens the ticket management and filtering dashboard panel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        staff: '<:Staff:1509557210861142186>',
        member: '<:Member:1509557217961967716>',
        mark: '<:Mark:1509557248534253568>',
        bell: '<:Bell:1509557209363775638>',
        warning: '<:Warning:1509557251181117500>',
        timeout: '<:Timeout:1509557597383168160>',
        refresh: '<:Refresh:1509557065713188874>'
    };

    const TRANSCRIPT_CHANNEL_ID = '1508526671333036193';
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // 1. TICKET PANEL SUBCOMMAND
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'panel') {
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

                    await btnInteraction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} Ticket Created`)
                                .setDescription(`>>> Your secure communication line has been established successfully at ${ticketChannel}.`)
                        ]
                    });

                    const channelCollector = controlMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button
                    });

                    channelCollector.on('collect', async (ticketBtnInteraction) => {
                        const isStaff = ticketBtnInteraction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
                        const actionId = ticketBtnInteraction.customId;

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
                            const currentEmbed = controlMessage.embeds[0];
                            const staffField = currentEmbed.fields.find(f => f.name.includes('ASSIGNED STAFF'));

                            if (!staffField || staffField.value.includes('Unclaimed')) {
                                return ticketBtnInteraction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor('#FF3333')
                                            .setTitle(`${emoji.warning} Action Denied`)
                                            .setDescription('>>> This support ticket cannot be unclaimed because it is not currently assigned to any staff member.')
                                    ],
                                    ephemeral: true
                                });
                            }

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
                            await ticketBtnInteraction.deferUpdate();
                            await initiateTicketClosure(ticketChannel, ticketBtnInteraction.user, 'No closure rationale specified.', guild, user, emoji, TRANSCRIPT_CHANNEL_ID);
                        }

                        // 4. CLOSE WITH REASON
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

                            const modalSubmit = await ticketBtnInteraction.awaitModalSubmit({
                                filter: i => i.customId === 'ticket_close_modal',
                                time: 60000
                            }).catch(() => null);

                            if (modalSubmit) {
                                  await modalSubmit.deferUpdate();
                                const formalReason = modalSubmit.fields.getTextInputValue('ticket_close_reason');
                                await initiateTicketClosure(ticketChannel, ticketBtnInteraction.user, formalReason, guild, user, emoji, TRANSCRIPT_CHANNEL_ID);
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

    // ────────────────────────────────────────────────────────────────────────
    // 2. TICKET MANAGEMENT DASHBOARD SUBCOMMAND
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'dashboard') {
        // CHANGED: ephemeral: false so the panel is completely visible to everyone in the channel
        await interaction.deferReply({ ephemeral: false });

        const fetchDashboardData = async (filterType) => {
            const guild = interaction.guild;
            const openChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText && c.name.startsWith('ticket-'));
            
            let activeTickets = [];

            for (const [id, channel] of openChannels) {
                const messages = await channel.messages.fetch({ limit: 15 }).catch(() => null);
                let claimedBy = null;

                if (messages) {
                    const claimLog = messages.find(m => m.content.includes('This ticket is now being handled by'));
                    if (claimLog) {
                        claimedBy = claimLog.content.split('by ')[1] || 'Staff Member';
                    }
                }

                activeTickets.push({
                    channel: channel,
                    name: channel.name,
                    createdTimestamp: channel.createdTimestamp,
                    claimedBy: claimedBy,
                    status: claimedBy ? 'claimed' : 'unclaimed'
                });
            }

            const dashboardEmbed = new EmbedBuilder()
                .setColor('#007FFF')
                .setTitle(`${emoji.staff} Ticket Management Infrastructure`)
                .setTimestamp();

            if (filterType === 'all' || filterType === 'claimed' || filterType === 'unclaimed') {
                let filtered = activeTickets;
                if (filterType === 'claimed') filtered = activeTickets.filter(t => t.status === 'claimed');
                if (filterType === 'unclaimed') filtered = activeTickets.filter(t => t.status === 'unclaimed');

                dashboardEmbed.setDescription(`>>> Displaying active server tickets matching your chosen view query filter: \`${filterType.toUpperCase()}\``);

                if (filtered.length === 0) {
                    dashboardEmbed.addFields({ name: 'Active Registry Index', value: `>>> No open tickets found matching the \`${filterType}\` status metric.` });
                } else {
                    let textList = '';
                    filtered.forEach(t => {
                        textList += `* ${emoji.mark} ${t.channel} (\`${t.name}\`)\n`;
                        textList += `  * **Created:** <t:${Math.floor(t.createdTimestamp / 1000)}:R>\n`;
                        textList += `  * **Assignment:** ${t.claimedBy ? `${t.claimedBy}` : `\`Unclaimed / Pending\``}\n\n`;
                    });
                    dashboardEmbed.addFields({ name: `Open Tickets Registry (${filtered.length})`, value: textList });
                }
            } else if (filterType === 'closed') {
                dashboardEmbed.setDescription(`>>> Pulling historical data entries directly from the transcript channel registers.`);
                
                const logChannel = await guild.channels.fetch(TRANSCRIPT_CHANNEL_ID).catch(() => null);
                if (!logChannel) {
                    dashboardEmbed.addFields({ name: 'Data Pipeline Failure', value: '>>> Unable to establish link connection with designated transcript logging channel directory.' });
                } else {
                    const logMessages = await logChannel.messages.fetch({ limit: 10 }).catch(() => null);
                    const archiveEmbeds = logMessages ? logMessages.filter(m => m.embeds.length > 0 && m.embeds[0].title.includes('Ticket Archive Logged')) : [];

                    if (!archiveEmbeds || archiveEmbeds.size === 0) {
                        dashboardEmbed.addFields({ name: 'Archive Logs Blank', value: '>>> No recently closed ticket archives discovered within the historical log registers.' });
                    } else {
                        let textList = '';
                        archiveEmbeds.forEach(m => {
                            const emb = m.embeds[0];
                            const channelAttr = emb.fields.find(f => f.name.includes('TICKET ATTRIBUTES'))?.value || 'Unknown Name';
                            const closureAttr = emb.fields.find(f => f.name.includes('CLOSURE OPERATION'))?.value || 'Unknown Operator';
                            
                            textList += `* ${emoji.timeout} **Archive Entry:** <t:${Math.floor(m.createdTimestamp / 1000)}:R>\n`;
                            textList += `  ${channelAttr}\n  ${closureAttr}\n\n`;
                        });
                        dashboardEmbed.addFields({ name: 'Recent Closed Records Index', value: textList });
                    }
                }
            }

            return dashboardEmbed;
        };

        const getDashboardButtons = (currentFilter = 'all') => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('dash_all').setLabel('All Open').setStyle(currentFilter === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('dash_unclaimed').setLabel('Unclaimed').setStyle(currentFilter === 'unclaimed' ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('dash_claimed').setLabel('Claimed').setStyle(currentFilter === 'claimed' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('dash_closed').setLabel('Closed Logs').setStyle(currentFilter === 'closed' ? ButtonStyle.Danger : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('dash_refresh').setEmoji('1509557065713188874').setStyle(ButtonStyle.Secondary)
        );

        let activeFilter = 'all';
        const initialEmbed = await fetchDashboardData(activeFilter);

        const dashboardMessage = await interaction.editReply({
            embeds: [initialEmbed],
            components: [getDashboardButtons(activeFilter)]
        });

        // ADDED: Auto-refresh background interval loops seamlessly every 5 minutes (300000 ms)
        const refreshInterval = setInterval(async () => {
            try {
                const autoUpdatedDashboard = await fetchDashboardData(activeFilter);
                await interaction.editReply({
                    embeds: [autoUpdatedDashboard],
                    components: [getDashboardButtons(activeFilter)]
                });
            } catch {
                // Safeguard against missing channel context structures gracefully
            }
        }, 300000);

        const dashCollector = dashboardMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000 
        });

        dashCollector.on('collect', async (dashInteraction) => {
            await dashInteraction.deferUpdate();
            
            const btnId = dashInteraction.customId;
            if (btnId === 'dash_all') activeFilter = 'all';
            if (btnId === 'dash_unclaimed') activeFilter = 'unclaimed';
            if (btnId === 'dash_claimed') activeFilter = 'claimed';
            if (btnId === 'dash_closed') activeFilter = 'closed';

            const updatedDashboard = await fetchDashboardData(activeFilter);
            await interaction.editReply({
                embeds: [updatedDashboard],
                components: [getDashboardButtons(activeFilter)]
            });
        });

        dashCollector.on('end', async () => {
            // ADDED: Safe clean-up layout to clear the background loop instance cleanly
            clearInterval(refreshInterval);
            try {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('d1').setLabel('Session Expired').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );
                await interaction.editReply({ components: [disabledRow] });
            } catch {
                // Suppress context loss errors cleanly
            }
        });
    }
}

// ────────────────────────────────────────────────────────────────────────
// 3. INTERACTIVE COUNTDOWN & CANCELLATION PROTOCOL ENGINE
// ────────────────────────────────────────────────────────────────────────
async function initiateTicketClosure(channel, executor, reason, guild, owner, emoji, logChannelId) {
    const COUNTDOWN_SECONDS = 10;
    const futureDeletionTimestamp = Math.floor((Date.now() + COUNTDOWN_SECONDS * 1000) / 1000);

    const countdownEmbed = new EmbedBuilder()
        .setColor('#FF3333')
        .setTitle(`${emoji.warning} Ticket Closure Sequence Locked`)
        .setDescription(
            `>>> This support channel has been queued for execution by **${executor.username}**.\n\n` +
            `All structural channel spaces and active messaging databases will be permanently deleted and wiped **<t:${futureDeletionTimestamp}:R>**.`
        )
        .addFields({ name: 'Reason for Closure', value: `\`\`\`\n${reason}\n\`\`\`` })
        .setTimestamp();

    const cancelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('abort_ticket_closure')
            .setLabel('Cancel Deletion')
            .setEmoji('1509557251181117500')
            .setStyle(ButtonStyle.Secondary)
    );

    const countdownMessage = await channel.send({
        embeds: [countdownEmbed],
        components: [cancelRow]
    });

    const closureCollector = countdownMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: COUNTDOWN_SECONDS * 1000
    });

    let closureAborted = false;

    closureCollector.on('collect', async (btnInteract) => {
        const isStaff = btnInteract.member.permissions.has(PermissionFlagsBits.ModerateMembers);
        
        if (!isStaff) {
            return btnInteract.reply({
                content: 'Access Denied. Only authorized staff members can abort active channel destruction arrays.',
                ephemeral: true
            });
        }

        if (btnInteract.customId === 'abort_ticket_closure') {
            closureAborted = true;
            closureCollector.stop('aborted');

            const abortEmbed = new EmbedBuilder()
                .setColor('#007FFF')
                .setTitle(`${emoji.mark} Termination Sequence Cancelled`)
                .setDescription(`>>> The ticket destruction array was intercepted and aborted successfully by ${btnInteract.user}. This private line remains active.`)
                .setTimestamp();

            await btnInteract.update({
                embeds: [abortEmbed],
                components: []
            });
        }
    });

    closureCollector.on('end', async (collected, endReason) => {
        if (closureAborted || endReason === 'aborted') return;

        const processingRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('processing')
                .setLabel('Archiving & Purging Database...')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        );

        await countdownMessage.edit({ components: [processingRow] }).catch(() => null);
        await processTicketArchival(channel, executor, reason, guild, owner, emoji, logChannelId);
    });
}

// ────────────────────────────────────────────────────────────────────────
// 4. DATA COMPILATION AND TRANSCRIPT PACKAGING ENGINE
// ────────────────────────────────────────────────────────────────────────
async function processTicketArchival(channel, executor, reason, guild, owner, emoji, logChannelId) {
    try {
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

        const textBuffer = Buffer.from(transcriptString, 'utf-8');
        const fileAttachment = new AttachmentBuilder(textBuffer, { name: `transcript-${channel.name}.txt` });

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

        await channel.delete().catch(() => null);

    } catch (err) {
        await channel.send({ content: `Critical tracking error failed to export historical text transcripts: ${err.message}` }).catch(() => null);
    }
}
