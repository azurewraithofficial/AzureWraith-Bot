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
    .setName('apply')
    .setDescription('Recruitment operations and staff recruitment infrastructure Management.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the premium persistent staff recruitment landing portal.')
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

    const REVIEW_CHANNEL_ID = '1508526369955381320';
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 1: RECRUITMENT PORTAL PANEL DEPLOYMENT MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.staff} SYSTEM CORE // RECRUITMENT OPERATIONS OPERATIONS DESK`)
            .setDescription(
                '>>> Looking to safeguard, moderate, and optimize our server infrastructure? We are actively vetting mature, analytical, and dedicated users to integrate directly into our active administrative layout layers.'
            )
            .addFields(
                {
                    name: `${emoji.member} ── SYSTEM ELIGIBILITY PRESETS`,
                    value: 
                        `* Must maintain an active, pristine account moderation record (Zero active infractions).\n` +
                        `* Possess advanced operational literacy regarding platform guidelines and staff code rules.\n` +
                        `* Maintain complete emotional calibration during high-stress escalation anomalies.`,
                    inline: false
                },
                {
                    name: `${emoji.warning} ── SUBMISSION DATA REGULATIONS`,
                    value: 
                        `* You are required to provide authentic biometric data and transparent history profiles.\n` +
                        `* Submitting malicious joke files will trigger immediate systemic ban blacklists.\n` +
                        `* File evaluation profiles scale across a variable **72-hour** review cycle queue.`,
                    inline: false
                },
                {
                    name: ' ',
                    value: '───\n' + `${emoji.mark} **Click the transmission button below to open a secure candidate profile.**`,
                    inline: false
                }
            )
            .setFooter({ text: 'Azure Wraith Operations Core • Secure Connection Established' })
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_apply_modal')
                .setLabel('Initialize Profile Application')
                .setEmoji('1509557210861142186') // Verified Staff Emoji
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ 
            content: `${emoji.mark} **Recruitment Portal Core Successfully Initiated.** Landing sequence deployed.`, 
            ephemeral: true 
        });

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 2: PERSISTENT COMPONENT COLLECTOR PIPELINE (USER HANDSHAKE)
        // ────────────────────────────────────────────────────────────────────────
        const panelCollector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button 
        });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_apply_modal') {
                
                const modal = new ModalBuilder()
                    .setCustomId('staff_apply_modal')
                    .setTitle('Recruitment Onboarding Framework');

                const ageInput = new TextInputBuilder()
                    .setCustomId('app_field_age')
                    .setLabel('Candidate Age & Metric Timezone')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 19 Years Old // GMT+2 (EST)')
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('app_field_exp')
                    .setLabel('Historical Administrative Operations Record')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Itemize past networks, duties handled, or relevant command fields...')
                    .setRequired(true);

                const motivationInput = new TextInputBuilder()
                    .setCustomId('app_field_motive')
                    .setLabel('Value Proposition Logic Matrix')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Explain why your profile output excels beyond standard server candidates...')
                    .setRequired(true);

                const availabilityInput = new TextInputBuilder()
                    .setCustomId('app_field_time')
                    .setLabel('Weekly Dedication Allocation Window')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 15-25 Hours weekly // High weekend availability')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(ageInput),
                    new ActionRowBuilder().addComponents(experienceInput),
                    new ActionRowBuilder().addComponents(motivationInput),
                    new ActionRowBuilder().addComponents(availabilityInput)
                );

                await btnInteraction.showModal(modal);

                // Index Input Await Loop (15-Minute Complete Overlay Buffer Gate)
                const modalSubmit = await btnInteraction.awaitModalSubmit({
                    filter: i => i.customId === 'staff_apply_modal',
                    time: 900000
                }).catch(() => null);

                if (!modalSubmit) return;
                await modalSubmit.deferReply({ ephemeral: true });

                const inputAge = modalSubmit.fields.getTextInputValue('app_field_age');
                const inputExp = modalSubmit.fields.getTextInputValue('app_field_exp');
                const inputMotive = modalSubmit.fields.getTextInputValue('app_field_motive');
                const inputTime = modalSubmit.fields.getTextInputValue('app_field_time');

                try {
                    const targetReviewChannel = await interaction.guild.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
                    
                    if (!targetReviewChannel) {
                        return modalSubmit.editReply({ 
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF3333')
                                    .setDescription(`${emoji.warning} **Data Pipeline Drop:** Routing to destination review channel timed out or was severed.`)
                            ] 
                        });
                    }

                    // ────────────────────────────────────────────────────────────────────────
                    // PHASE 3: STAFF PACKET ARCHITECTURE (SENT TO AUDIT DIRECTORY)
                    // ────────────────────────────────────────────────────────────────────────
                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF') // Active Grid Azure
                        .setTitle(`${emoji.staff} EVALUATION DATA // NEW CANDIDATE PACKET`)
                        .setDescription(`>>> A clean user data file has been compiled and forwarded to the evaluation desk. Review biometric tags before flashing resolution keys.`)
                        .addFields(
                            { 
                                name: `${emoji.member} ── PROFILE IDENTIFICATION`, 
                                value: `* **User Account:** ${modalSubmit.user}\n* **Account Tag:** \`${modalSubmit.user.tag}\`\n* **Snowflake ID:** \`${modalSubmit.user.id}\``, 
                                inline: true 
                            },
                            { 
                                name: `📊 ── RECRUITMENT METRICS`, 
                                value: `* **Age Bracket & Zone:** \`${inputAge}\`\n* **Dedication Output:** \`${inputTime}\``, 
                                inline: true 
                            },
                            { 
                                name: `${emoji.bell} ── HISTORY & RECORD METRIC LOGS`, 
                                value: `\`\`\`\n${inputExp}\n\`\`\``, 
                                inline: false 
                            },
                            { 
                                name: `${emoji.mark} ── MOTIVATIONAL ALIGNMENT VALUES`, 
                                value: `\`\`\`\n${inputMotive}\n\`\`\``, 
                                inline: false 
                            }
                        )
                        .setThumbnail(modalSubmit.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: 'Evaluation Pipeline Queue Enabled' })
                        .setTimestamp();

                    const reviewActionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('staff_app_accept')
                            .setLabel('Approve Profile')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('staff_app_decline')
                            .setLabel('Reject Profile')
                            .setStyle(ButtonStyle.Danger)
                    );

                    const staffLogMessage = await targetReviewChannel.send({ 
                        embeds: [reviewEmbed], 
                        components: [reviewActionRow] 
                    });

                    // Success Confirmation Payload to User Client
                    await modalSubmit.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#007FFF')
                                .setTitle(`${emoji.mark} PIPELINE REFRESH // PROFILE TRANSMITTED`)
                                .setDescription(`>>> Your application variables have been cleanly indexed, locked, and compiled into our data registry layout. Operations leadership will evaluate your file soon.`)
                        ]
                    });

                    // ────────────────────────────────────────────────────────────────────────
                    // PHASE 4: INTERACTIVE OPERATIONS DISPOSITION FLOW
                    // ────────────────────────────────────────────────────────────────────────
                    const staffLogCollector = staffLogMessage.createMessageComponentCollector({ 
                        componentType: ComponentType.Button 
                    });

                    staffLogCollector.on('collect', async (staffInteraction) => {
                        if (!staffInteraction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                            return staffInteraction.reply({ 
                                content: `${emoji.warning} **Access Restriction:** Your administrative authorization level is insufficient to resolve recruitment entries.`, 
                                ephemeral: true 
                            });
                        }

                        // Disposition Node A: Candidate Accepted
                        if (staffInteraction.customId === 'staff_app_accept') {
                            const acceptedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#00FF7F') // High-Contrast Matrix Green
                                .setTitle(`${emoji.mark} RECORD LOGGED // CANDIDATE ACCEPTED`)
                                .addFields({ 
                                    name: `${emoji.staff} ── PIPELINE DISPOSITION ACTION`, 
                                    value: `* **Authorized By:** ${staffInteraction.user}\n* **System State:** \`APPROVED\`\n* **Protocol:** Initialize local onboarding role arrays.`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [acceptedEmbed], components: [] });
                            staffLogCollector.stop();
                        } 
                        
                        // Disposition Node B: Candidate Declined
                        else if (staffInteraction.customId === 'staff_app_decline') {
                            const declinedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#FF3333') // Pure Threat Crimson
                                .setTitle(`${emoji.warning} RECORD LOGGED // CANDIDATE REJECTED`)
                                .addFields({ 
                                    name: `${emoji.staff} ── PIPELINE DISPOSITION ACTION`, 
                                    value: `* **Authorized By:** ${staffInteraction.user}\n* **System State:** \`DENIED / ARCHIVED\`\n* **Protocol:** Profile closed and dropped into systemic data vault storage.`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [declinedEmbed], components: [] });
                            staffLogCollector.stop();
                        }
                    });

                } catch (error) {
                    console.error('[Recruitment Crash Failure Log]:', error);
                }
            }
        });
    }
}
