import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType, 
    PermissionFlagsBits, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('applypartner')
    .setDescription('Deploy the cross-network Partnership submission portal.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the persistent Partnership request landing panel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    // Custom High-Fidelity Emoji Vector Asset Matrix
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
    };

    const PARTNER_REVIEW_CHANNEL_ID = '1508525293512429740';
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 1: PARTNERSHIP PORTAL PANEL DEPLOYMENT MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`🤝 SYSTEM CORE // ALLIANCE & PARTNERSHIP GATEWAY`)
            .setDescription(
                '>>> Looking to merge community target demographics, execute brand cross-promotions, or inter-link infrastructure networks? Submit an official corporate partnership profile packet below.'
            )
            .addFields(
                {
                    name: `${emoji.member} ── SYSTEM ELIGIBILITY PROTOCOLS`,
                    value: 
                        `* Community hubs must strictly follow official Discord Terms of Service guidelines.\n` +
                        `* Networks must maintain an authentic user audience free of simulated bot metrics.\n` +
                        `* Must designate a verified operational representative inside our network layout.`,
                    inline: false
                },
                {
                    name: ' ',
                    value: '───\n' + `${emoji.mark} **Click the transmission button below to file your community credentials.**`,
                    inline: false
                }
            )
            .setFooter({ text: 'Azure Wraith Network Alliances • Secure Connection Established' })
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_partner_modal')
                .setLabel('Request Alliance Partnership')
                .setEmoji('🤝')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ 
            content: `${emoji.mark} **Partnership Transmission Core Successfully Initiated.** Registry framework deployed.`, 
            ephemeral: true 
        });

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 2: PERSISTENT COMPONENT COLLECTOR PIPELINE (USER HANDSHAKE)
        // ────────────────────────────────────────────────────────────────────────
        const panelCollector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button 
        });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_partner_modal') {
                
                const modal = new ModalBuilder()
                    .setCustomId('partner_apply_modal')
                    .setTitle('Alliance Registration Grid');

                const nameInput = new TextInputBuilder()
                    .setCustomId('pt_field_name')
                    .setLabel('Community Identity & Primary Link')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., Azure Network // discord.gg/example')
                    .setRequired(true);

                const sizeInput = new TextInputBuilder()
                    .setCustomId('pt_field_size')
                    .setLabel('Total Audience Metrics & Engagement Scale')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 2,500 Members // Steady daily text frequency')
                    .setRequired(true);

                const contextInput = new TextInputBuilder()
                    .setCustomId('pt_field_context')
                    .setLabel('Brand Profile & Strategic Alignment Values')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Detail your operational theme: Gaming, technology, software development, etc...')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nameInput),
                    new ActionRowBuilder().addComponents(sizeInput),
                    new ActionRowBuilder().addComponents(contextInput)
                );

                await btnInteraction.showModal(modal);

                // Index Input Await Loop (15-Minute Complete Overlay Buffer Gate)
                const modalSubmit = await btnInteraction.awaitModalSubmit({
                    filter: i => i.customId === 'partner_apply_modal',
                    time: 900000
                }).catch(() => null);

                if (!modalSubmit) return;
                await modalSubmit.deferReply({ ephemeral: true });

                const inputName = modalSubmit.fields.getTextInputValue('pt_field_name');
                const inputSize = modalSubmit.fields.getTextInputValue('pt_field_size');
                const inputContext = modalSubmit.fields.getTextInputValue('pt_field_context');

                try {
                    const targetReviewChannel = await interaction.guild.channels.fetch(PARTNER_REVIEW_CHANNEL_ID).catch(() => null);
                    
                    if (!targetReviewChannel) {
                        return modalSubmit.editReply({ 
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF3333')
                                    .setDescription(`${emoji.warning} **Data Pipeline Drop:** Routing to destination alliance review channel timed out or was severed.`)
                            ] 
                        });
                    }

                    // ────────────────────────────────────────────────────────────────────────
                    // PHASE 3: ALLIANCE PACKET ARCHITECTURE (SENT TO AUDIT DIRECTORY)
                    // ────────────────────────────────────────────────────────────────────────
                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF') // Active Grid Azure
                        .setTitle(`🤝 EVALUATION DATA // NEW PARTNERSHIP PACKET`)
                        .setDescription(`>>> A new network expansion candidate profile has requested cross-promotional clearance and resource grid inter-linking.`)
                        .addFields(
                            { 
                                name: `${emoji.member} ── REPRESENTATIVE PROFILE`, 
                                value: `* **User Account:** ${modalSubmit.user}\n* **Account Tag:** \`${modalSubmit.user.tag}\`\n* **Snowflake ID:** \`${modalSubmit.user.id}\``, 
                                inline: true 
                            },
                            { 
                                name: `📈 ── TARGET ASSET METRICS`, 
                                value: `* **Asset Name:** \`${inputName}\`\n* **Reported Size:** \`${inputSize}\``, 
                                inline: true 
                            },
                            { 
                                name: `📝 ── TARGET BRAND VALUE DESCRIPTION`, 
                                value: `\`\`\`\n${inputContext}\n\`\`\``, 
                                inline: false 
                            }
                        )
                        .setThumbnail(modalSubmit.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: 'Partnership Evaluation Queue Enabled' })
                        .setTimestamp();

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('pt_app_accept')
                            .setLabel('Approve Alliance')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('pt_app_decline')
                            .setLabel('Reject Alliance')
                            .setStyle(ButtonStyle.Danger)
                    );

                    const reviewLog = await targetReviewChannel.send({ 
                        embeds: [reviewEmbed], 
                        components: [actionRow] 
                    });

                    // Success Confirmation Payload to User Client
                    await modalSubmit.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} PIPELINE REFRESH // DATA COMPLED`)
                                .setDescription(`>>> Your partnership variables have been cleanly indexed, locked, and compiled into our registry layout. Relations leadership will evaluate your file soon.`)
                        ]
                    });

                    // ────────────────────────────────────────────────────────────────────────
                    // PHASE 4: INTERACTIVE OPERATIONS DISPOSITION FLOW
                    // ────────────────────────────────────────────────────────────────────────
                    const logCollector = reviewLog.createMessageComponentCollector({ 
                        componentType: ComponentType.Button 
                    });

                    logCollector.on('collect', async (staffInteraction) => {
                        if (!staffInteraction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                            return staffInteraction.reply({ 
                                content: `${emoji.warning} **Access Restriction:** Your administrative authorization level is insufficient to resolve expansion entries.`, 
                                ephemeral: true 
                            });
                        }

                        // Disposition Node A: Candidate Accepted
                        if (staffInteraction.customId === 'pt_app_accept') {
                            const accepted = EmbedBuilder.from(reviewLog.embeds[0])
                                .setColor('#00FF7F') // High-Contrast Matrix Green
                                .setTitle(`🤝 RECORD LOGGED // ALLIANCE ESTABLISHED`)
                                .addFields({ 
                                    name: `${emoji.staff} ── PIPELINE DISPOSITION ACTION`, 
                                    value: `* **Authorized By:** ${staffInteraction.user}\n* **System State:** \`APPROVED\`\n* **Protocol:** Initialize server directory synchronization and broadcast channels.`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [accepted], components: [] });
                            logCollector.stop();
                        } 
                        
                        // Disposition Node B: Candidate Declined
                        else if (staffInteraction.customId === 'pt_app_decline') {
                            const declined = EmbedBuilder.from(reviewLog.embeds[0])
                                .setColor('#FF3333') // Pure Threat Crimson
                                .setTitle(`${emoji.warning} RECORD LOGGED // ALLIANCE REJECTED`)
                                .addFields({ 
                                    name: `${emoji.staff} ── PIPELINE DISPOSITION ACTION`, 
                                    value: `* **Authorized By:** ${staffInteraction.user}\n* **System State:** \`DENIED / ARCHIVED\`\n* **Protocol:** Profile closed and dropped into systemic data vault storage.`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [declined], components: [] });
                            logCollector.stop();
                        }
                    });

                } catch (err) {
                    console.error('[Partnership Registry Crash Failure Log]:', err);
                }
            }
        });
    }
}
