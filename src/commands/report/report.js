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
    .setName('report')
    .setDescription('Incident reporting infrastructure management.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the persistent user-incident reporting portal panel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
    // Custom Emojis - Using your verified asset IDs
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>',
        timeout: '<:Timeout:1509557597383168160>',
        kick: '<:PersonKick:1509557598691790968>'
    };

    const REVIEW_CHANNEL_ID = '1508526293447348235';
    const CLOSED_REPORTS_CHANNEL_ID = '1508526855047872693'; // Targeted Archival Hub
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // LOCAL UTILITY: ARCHIVE CLOSED LOG ROUTER
    // ────────────────────────────────────────────────────────────────────────
    async function archiveClosedReport(guild, embed) {
        try {
            const archiveChannel = await guild.channels.fetch(CLOSED_REPORTS_CHANNEL_ID).catch(() => null);
            if (archiveChannel) {
                await archiveChannel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error(`[Archive Error] Failed to route closed report entry to database:`, err);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // 1. REPORT PORTAL PANEL DEPLOYMENT
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.bell} Azure Wraith Incident Reporting Portal`)
            .setDescription(
                '>>> Notice a player violating server guidelines, exploiting mechanics, or engaging in toxic behavior? Help protect our community ecosystem by filing an official incident report directly to our moderation desk.'
            )
            .addFields(
                {
                    name: `${emoji.member} __SUBMISSION PARAMETERS__`,
                    value: 
                        `* Please specify the exact username or user snowflake ID of the suspect account.\n` +
                        `* Be detailed and clear in your incident summary to ensure swift processing.\n` +
                        `* Provide external hyperlinks to valid image/video proof (Imgur, Medal, Streamable, etc.).`,
                    inline: false
                },
                {
                    name: `${emoji.warning} __FALSE REPORTING POLICY__`,
                    value: 
                        `* Submitting joke reports, intentionally fabricated evidence, or weaponizing the reporting system will result in severe server discipline and blocklists.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.mark} **Click the form button below to initialize a secure report file.**`,
                    inline: false
                }
            )
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_report_modal')
                .setLabel('File Incident Report')
                .setEmoji('1509557251181117500') // Warning Emoji
                .setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({
            content: 'The incident reporting portal has been deployed successfully.',
            ephemeral: true
        });

        // ────────────────────────────────────────────────────────────────────────
        // 2. MODAL FORM OVERLAY POPUP HANDLING (USER HANDSHAKE)
        // ────────────────────────────────────────────────────────────────────────
        const panelCollector = response.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_report_modal') {
                
                const modal = new ModalBuilder()
                    .setCustomId('incident_report_modal')
                    .setTitle('File Server Incident Report');

                const targetInput = new TextInputBuilder()
                    .setCustomId('report_field_target')
                    .setLabel('Who are you reporting?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Username or unique account User ID...')
                    .setRequired(true);

                const reasonInput = new TextInputBuilder()
                    .setCustomId('report_field_reason')
                    .setLabel('Detailed Description of Incident')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Explain exactly what took place, tracking dates or context details...')
                    .setRequired(true);

                const evidenceInput = new TextInputBuilder()
                    .setCustomId('report_field_evidence')
                    .setLabel('Evidence & Proof Links')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Paste your screenshot URLs, video clips, or image upload links here...')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(targetInput),
                    new ActionRowBuilder().addComponents(reasonInput),
                    new ActionRowBuilder().addComponents(evidenceInput)
                );

                await btnInteraction.showModal(modal);

                // Await user compilation entry block (5-minute expiration safety gate)
                const modalSubmit = await btnInteraction.awaitModalSubmit({
                    filter: i => i.customId === 'incident_report_modal',
                    time: 300000
                }).catch(() => null);

                if (!modalSubmit) return;
                await modalSubmit.deferReply({ ephemeral: true });

                const inputTarget = modalSubmit.fields.getTextInputValue('report_field_target');
                const inputReason = modalSubmit.fields.getTextInputValue('report_field_reason');
                const inputEvidence = modalSubmit.fields.getTextInputValue('report_field_evidence');

                try {
                    const targetReviewChannel = await interaction.guild.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
                    
                    if (!targetReviewChannel) {
                        return modalSubmit.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF3333')
                                    .setTitle(`${emoji.warning} Data Pipeline Failure`)
                                    .setDescription('>>> The core system application was unable to establish a valid routing connection with the review channel directory.')
                            ]
                        });
                    }

                    // ────────────────────────────────────────────────────────────────────────
                    // 3. STAFF REVIEW COMMAND GRID DEPLOYMENT
                    // ────────────────────────────────────────────────────────────────────────
                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF') // Active Azure Blue
                        .setTitle(`${emoji.warning} Pending Incident Review Log`)
                        .setDescription(`>>> A new user-filed report has arrived from the client portal interface and requires administrative clearing.`)
                        .addFields(
                            {
                                name: `${emoji.member} __REPORTER SOURCE__`,
                                value: `* **User Account:** ${modalSubmit.user} (${modalSubmit.user.tag})\n* **Account ID:** \`${modalSubmit.user.id}\``,
                                inline: true
                            },
                            {
                                name: `${emoji.timeout} __TARGET SUSPECT__`,
                                value: `* **Provided Identifier:** \`${inputTarget}\``,
                                inline: true
                            },
                            {
                                name: `${emoji.bell} __STATEMENT DETAILS__`,
                                value: `\`\`\`\n${inputReason}\n\`\`\``,
                                inline: false
                            },
                            {
                                name: `${emoji.mark} __SUBMITTED EVIDENCE PROFILE__`,
                                value: `${inputEvidence}`,
                                inline: false
                            }
                        )
                        .setTimestamp();

                    const staffActionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('staff_decline').setLabel('Decline').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('staff_timeout').setLabel('Timeout').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('staff_kick').setLabel('Kick').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('staff_ban').setLabel('Ban').setStyle(ButtonStyle.Danger)
                    );

                    const staffLogMessage = await targetReviewChannel.send({
                        embeds: [reviewEmbed],
                        components: [staffActionRow]
                    });

                    // Send receipt verification back to user client
                    await modalSubmit.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} Data Submission Finalized`)
                                .setDescription(`>>> Your report data packet has been safely encrypted, routed, and delivered straight to the server administration command desk. Thank you for your assistance.`)
                        ]
                    });

                    // ────────────────────────────────────────────────────────────────────────
                    // 4. INTERACTIVE STAFF ACTIONS MATRIX COLLECTOR (LIVE ENFORCEMENT UPGRADE)
                    // ────────────────────────────────────────────────────────────────────────
                    const staffLogCollector = staffLogMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button
                    });

                    // Helper to extract clean snowflake IDs from text inputs or mentions
                    const targetId = inputTarget.match(/\d+/)?.[0];

                    staffLogCollector.on('collect', async (staffInteraction) => {
                        const isStaff = staffInteraction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
                        if (!isStaff) {
                            return staffInteraction.reply({
                                content: 'Access Restriction. This operational interface matrix is strictly locked to server staff members.',
                                ephemeral: true
                            });
                        }

                        const actionId = staffInteraction.customId;
                        const auditReason = `Azure Report Resolved by ${staffInteraction.user.tag} | Case Statement: ${inputReason}`;

                        // INTERACTION A: DECLINE REPORT
                        if (actionId === 'staff_decline') {
                            const updatedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#777777')
                                .setTitle(`${emoji.timeout} Incident Review Dismissed`)
                                .addFields({ 
                                    name: `${emoji.staff} __RESOLUTION ENFORCEMENT__`, 
                                    value: `* **Actioned By:** ${staffInteraction.user}\n* **Execution Result:** Case Voided / Dismissed\n* **API Status:** No Action Taken`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [updatedEmbed], components: [] });
                            await archiveClosedReport(staffInteraction.guild, updatedEmbed);
                            staffLogCollector.stop();
                        }

                        // INTERACTION B: TIMEOUT ENFORCEMENT
                        if (actionId === 'staff_timeout') {
                            const timeoutModal = new ModalBuilder()
                                .setCustomId('staff_timeout_modal')
                                .setTitle('Process User Timeout Action');

                            const timeInput = new TextInputBuilder()
                                .setCustomId('timeout_duration')
                                .setLabel('Duration Matrix (e.g., 10m, 2h, 1d, 7d)')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            timeoutModal.addComponents(new ActionRowBuilder().addComponents(timeInput));
                            await staffInteraction.showModal(timeoutModal);

                            const timeoutSubmit = await staffInteraction.awaitModalSubmit({
                                filter: i => i.customId === 'staff_timeout_modal',
                                time: 60000
                            }).catch(() => null);

                            if (timeoutSubmit) {
                                const durationInput = timeoutSubmit.fields.getTextInputValue('timeout_duration');
                                
                                // Basic MS duration converter
                                let durationMs = 10 * 60 * 1000; // Default 10m fallback
                                const timeValue = parseInt(durationInput);
                                if (!isNaN(timeValue)) {
                                    if (durationInput.includes('m')) durationMs = timeValue * 60 * 1000;
                                    else if (durationInput.includes('h')) durationMs = timeValue * 60 * 60 * 1000;
                                    else if (durationInput.includes('d')) durationMs = timeValue * 24 * 60 * 60 * 1000;
                                }

                                let apiStatus = 'Successfully Enforced';
                                if (!targetId) {
                                    apiStatus = '⚠️ Failed: Could not resolve valid target Snowflake User ID from input.';
                                } else {
                                    const targetMember = await staffInteraction.guild.members.fetch(targetId).catch(() => null);
                                    if (targetMember) {
                                        await targetMember.timeout(durationMs, auditReason).catch(err => { apiStatus = `⚠️ API Error: ${err.message}`; });
                                    } else {
                                        apiStatus = '⚠️ Failed: Suspect is not currently present in this server guild.';
                                    }
                                }

                                const updatedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                    .setColor('#FFA500')
                                    .setTitle(`${emoji.timeout} Incident Actioned: Isolation Timeout Locked`)
                                    .addFields({ 
                                        name: `${emoji.staff} __RESOLUTION ENFORCEMENT__`, 
                                        value: `* **Actioned By:** ${timeoutSubmit.user}\n* **Execution Result:** Target Profile Placed in Isolation\n* **Assigned Duration:** \`${durationInput}\`\n* **Network Status:** \`${apiStatus}\``, 
                                        inline: false 
                                    });

                                await timeoutSubmit.update({ embeds: [updatedEmbed], components: [] });
                                await archiveClosedReport(timeoutSubmit.guild, updatedEmbed);
                                staffLogCollector.stop();
                            }
                        }

                        // INTERACTION C: KICK ENFORCEMENT
                        if (actionId === 'staff_kick') {
                            let apiStatus = 'Successfully Enforced';
                            if (!targetId) {
                                apiStatus = '⚠️ Failed: Could not parse a valid numerical User ID.';
                            } else {
                                const targetMember = await staffInteraction.guild.members.fetch(targetId).catch(() => null);
                                if (targetMember) {
                                    await targetMember.kick(auditReason).catch(err => { apiStatus = `⚠️ API Error: ${err.message}`; });
                                } else {
                                    apiStatus = '⚠️ Failed: Suspect is not in the server to be kicked.';
                                }
                            }

                            const updatedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#FF3333')
                                .setTitle(`${emoji.kick} Incident Actioned: Member Ejected`)
                                .addFields({ 
                                    name: `${emoji.staff} __RESOLUTION ENFORCEMENT__`, 
                                    value: `* **Actioned By:** ${staffInteraction.user}\n* **Execution Result:** Account Server Expulsion Ejection\n* **Network Status:** \`${apiStatus}\``, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [updatedEmbed], components: [] });
                            await archiveClosedReport(staffInteraction.guild, updatedEmbed);
                            staffLogCollector.stop();
                        }

                        // INTERACTION D: PERMANENT BAN ENFORCEMENT
                        if (actionId === 'staff_ban') {
                            let apiStatus = 'Successfully Enforced';
                            if (!targetId) {
                                apiStatus = '⚠️ Failed: Could not parse a valid numerical User ID.';
                            } else {
                                await staffInteraction.guild.members.ban(targetId, { reason: auditReason }).catch(err => { 
                                    apiStatus = `⚠️ API Error: ${err.message}`; 
                                });
                            }

                            const updatedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#8B0000')
                                .setTitle(`${emoji.warning} Incident Actioned: Permanent Blacklist`)
                                .addFields({ 
                                    name: `${emoji.staff} __RESOLUTION ENFORCEMENT__`, 
                                    value: `* **Actioned By:** ${staffInteraction.user}\n* **Execution Result:** Account Globally Severed & Banned\n* **Network Status:** \`${apiStatus}\``, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [updatedEmbed], components: [] });
                            await archiveClosedReport(staffInteraction.guild, updatedEmbed);
                            staffLogCollector.stop();
                        }
                    });

                } catch (err) {
                    console.error(`[Matrix Execution Error] Critical pipeline crash:`, err);
                }
            }
        });
    }
}
