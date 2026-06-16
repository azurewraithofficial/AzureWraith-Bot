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
    .setName('applyevent')
    .setDescription('Deploy the automated Event Host recruitment system framework.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the premium persistent Event Host application landing panel.')
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
    // PHASE 1: EVENT PORTAL PANEL DEPLOYMENT MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`🎉 SYSTEM CORE // EVENT TEAM OPERATIONS DESK`)
            .setDescription(
                '>>> Passionate about cultivating community activity, designing server games, and coordinating high-tier tournaments? Step up and apply to integrate directly into our official server activities division.'
            )
            .addFields(
                {
                    name: `${emoji.member} ── DIVISIONAL HOSTING CRITERIA`,
                    value: 
                        `* Must possess a highly creative mindset and absolute confidence managing large voice/text channels.\n` +
                        `* Ability to cleanly coordinate with staff regarding network budget and prize distributions.\n` +
                        `* Maintain active calendar availability to execute at least **1-2 major activities** weekly.`,
                    inline: false
                },
                {
                    name: ' ',
                    value: '───\n' + `${emoji.mark} **Click the transmission button below to file an Event Host application file.**`,
                    inline: false
                }
            )
            .setFooter({ text: 'Azure Wraith Event Division • Secure Connection Established' })
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_event_modal')
                .setLabel('Initialize Host Application')
                .setEmoji('🎉')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ 
            content: `${emoji.mark} **Event Team Recruitment Core Successfully Initiated.** Landing sequence deployed.`, 
            ephemeral: true 
        });

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 2: PERSISTENT COMPONENT COLLECTOR PIPELINE (USER HANDSHAKE)
        // ────────────────────────────────────────────────────────────────────────
        const panelCollector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button 
        });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_event_modal') {
                
                const modal = new ModalBuilder()
                    .setCustomId('event_apply_modal')
                    .setTitle('Event Host Onboarding Registry');

                const conceptsInput = new TextInputBuilder()
                    .setCustomId('ev_field_concepts')
                    .setLabel('Detail 2 unique event ideas you would host.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Describe structural rules, text/voice channel layouts, and target mechanics...')
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('ev_field_exp')
                    .setLabel('Past coordination or hosting experience?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Itemize past network roles, public speaking history, or user engagement background...')
                    .setRequired(true);

                const timeInput = new TextInputBuilder()
                    .setCustomId('ev_field_time')
                    .setLabel('Candidate Metric Timezone & Schedule')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., GMT+2 // Most active during peak weekend activation windows')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(conceptsInput),
                    new ActionRowBuilder().addComponents(experienceInput),
                    new ActionRowBuilder().addComponents(timeInput)
                );

                await btnInteraction.showModal(modal);

                // Index Input Await Loop (15-Minute Complete Overlay Buffer Gate)
                const modalSubmit = await btnInteraction.awaitModalSubmit({
                    filter: i => i.customId === 'event_apply_modal',
                    time: 900000
                }).catch(() => null);

                if (!modalSubmit) return;
                await modalSubmit.deferReply({ ephemeral: true });

                const inputConcepts = modalSubmit.fields.getTextInputValue('ev_field_concepts');
                const inputExp = modalSubmit.fields.getTextInputValue('ev_field_exp');
                const inputTime = modalSubmit.fields.getTextInputValue('ev_field_time');

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
                    // PHASE 3: EVENT PACKET ARCHITECTURE (SENT TO AUDIT DIRECTORY)
                    // ────────────────────────────────────────────────────────────────────────
                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF') // Active Grid Azure
                        .setTitle(`🎉 EVALUATION DATA // NEW EVENT HOST PACKET`)
                        .setDescription(`>>> A clean activity division data file has been compiled and forwarded to the evaluation desk. Review structural answers before flashing resolution keys.`)
                        .addFields(
                            { 
                                name: `${emoji.member} ── PROFILE IDENTIFICATION`, 
                                value: `* **User Account:** ${modalSubmit.user}\n* **Account Tag:** \`${modalSubmit.user.tag}\`\n* **Snowflake ID:** \`${modalSubmit.user.id}\``, 
                                inline: true 
                            },
                            { 
                                name: `📊 ── AVAILABILITY PROFILE`, 
                                value: `* **Metric Zone & Schedule:**\n\`${inputTime}\``, 
                                inline: true 
                            },
                            { 
                                name: `💡 ── CONCEPTUAL ACTIVITY ARCHITECTURE`, 
                                value: `\`\`\`\n${inputConcepts}\n\`\`\``, 
                                inline: false 
                            },
                            { 
                                name: `🛡️ ── EXPERIENCE & COMPETENCY METRICS`, 
                                value: `\`\`\`\n${inputExp}\n\`\`\``, 
                                inline: false 
                            }
                        )
                        .setThumbnail(modalSubmit.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ text: 'Activity Pipeline Queue Enabled' })
                        .setTimestamp();

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ev_app_accept')
                            .setLabel('Approve Host')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ev_app_decline')
                            .setLabel('Reject Host')
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
                                .setTitle(`${emoji.mark} PIPELINE REFRESH // PROFILE TRANSMITTED`)
                                .setDescription(`>>> Your application variables have been cleanly indexed, locked, and compiled into our data registry layout. Activities leadership will evaluate your file soon.`)
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
                                content: `${emoji.warning} **Access Restriction:** Your administrative authorization level is insufficient to resolve recruitment entries.`, 
                                ephemeral: true 
                            });
                        }

                        // Disposition Node A: Candidate Accepted
                        if (staffInteraction.customId === 'ev_app_accept') {
                            const accepted = EmbedBuilder.from(reviewLog.embeds[0])
                                .setColor('#00FF7F') // High-Contrast Matrix Green
                                .setTitle(`🎉 RECORD LOGGED // EVENT HOST ACCEPTED`)
                                .addFields({ 
                                    name: `${emoji.staff} ── PIPELINE DISPOSITION ACTION`, 
                                    value: `* **Authorized By:** ${staffInteraction.user}\n* **System State:** \`APPROVED\`\n* **Protocol:** Initialize activity authorization keys and host alignment roles.`, 
                                    inline: false 
                                });

                            await staffInteraction.update({ embeds: [accepted], components: [] });
                            logCollector.stop();
                        } 
                        
                        // Disposition Node B: Candidate Declined
                        else if (staffInteraction.customId === 'ev_app_decline') {
                            const declined = EmbedBuilder.from(reviewLog.embeds[0])
                                .setColor('#FF3333') // Pure Threat Crimson
                                .setTitle(`${emoji.warning} RECORD LOGGED // EVENT HOST REJECTED`)
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
                    console.error('[Event Recruitment Crash Failure Log]:', err);
                }
            }
        });
    }
}
