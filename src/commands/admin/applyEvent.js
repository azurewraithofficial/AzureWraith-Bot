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
            .setDescription('Deploys the persistent Event Host application landing panel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
    };

    const REVIEW_CHANNEL_ID = '1508526369955381320';
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`🎉 Event Team Operations Portal`)
            .setDescription('>>> Passionate about cultivating community activity, designing server games, and coordinating high-tier tournaments? Step up and apply to become an official Server Event Host.')
            .addFields(
                {
                    name: `${emoji.member} __HOSTING CRITERIA__`,
                    value: 
                        `* Must possess a highly creative mindset and confidence managing large voice/text channels.\n` +
                        `* Ability to cleanly coordinate with staff regarding prize distributions.\n` +
                        `* Active calendar availability to run at least 1-2 major activities weekly.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.mark} **Click the form link below to file an Event Host application file.**`,
                    inline: false
                }
            )
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_event_modal')
                .setLabel('Submit Event Host Form')
                .setEmoji('🎉')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ content: 'Event Team recruitment interface active.', ephemeral: true });

        const panelCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_event_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('event_apply_modal')
                    .setTitle('Event Host Onboarding Registry');

                const conceptsInput = new TextInputBuilder()
                    .setCustomId('ev_field_concepts')
                    .setLabel('Detail 2 unique event ideas you would host.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Describe the rules, target channel layout, and structure...')
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('ev_field_exp')
                    .setLabel('Past coordination or hosting experience?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('List any previous server management roles or public speaking history...')
                    .setRequired(true);

                const timeInput = new TextInputBuilder()
                    .setCustomId('ev_field_time')
                    .setLabel('What is your active timezone & schedule?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., GMT+2 | Most active during weekends')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(conceptsInput),
                    new ActionRowBuilder().addComponents(experienceInput),
                    new ActionRowBuilder().addComponents(timeInput)
                );

                await btnInteraction.showModal(modal);

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
                    if (!targetReviewChannel) return modalSubmit.editReply({ content: `${emoji.warning} Target destination pipeline dropped.` });

                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`🎉 Pending Event Host Application`)
                        .setDescription(`>>> A new application has been registered for the server activities division.`)
                        .addFields(
                            { name: `${emoji.member} __APPLICANT PROFILE__`, value: `* **User:** ${modalSubmit.user}\n* **ID:** \`${modalSubmit.user.id}\`\n* **Zone:** \`${inputTime}\``, inline: false },
                            { name: `💡 __CONCEPT ARCHITECTURE__`, value: `\`\`\`\n${inputConcepts}\n\`\`\``, inline: false },
                            { name: `🛡️ __HISTORY & COMPETENCY__`, value: `\`\`\`\n${inputExp}\n\`\`\``, inline: false }
                        )
                        .setTimestamp();

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('ev_app_accept').setLabel('Accept Host').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('ev_app_decline').setLabel('Decline Host').setStyle(ButtonStyle.Danger)
                    );

                    const reviewLog = await targetReviewChannel.send({ embeds: [reviewEmbed], components: [actionRow] });

                    await modalSubmit.editReply({
                        embeds: [new EmbedBuilder().setColor('#007FFF').setDescription(`${emoji.mark} **Your file has been indexed.** Event leadership will process your request shortly.`)]
                    });

                    const logCollector = reviewLog.createMessageComponentCollector({ componentType: ComponentType.Button });

                    logCollector.on('collect', async (staffInteraction) => {
                        if (!staffInteraction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                            return staffInteraction.reply({ content: 'Elevated administrative clearances required.', ephemeral: true });
                        }

                        if (staffInteraction.customId === 'ev_app_accept') {
                            const accepted = EmbedBuilder.from(reviewLog.embeds[0]).setColor('#44FF44').setTitle(`🎉 Event Host Application: APPROVED`).addFields({ name: `🛠️ __DISPOSITION__`, value: `* **Approved By:** ${staffInteraction.user}`, inline: false });
                            await staffInteraction.update({ embeds: [accepted], components: [] });
                            logCollector.stop();
                        } else if (staffInteraction.customId === 'ev_app_decline') {
                            const declined = EmbedBuilder.from(reviewLog.embeds[0]).setColor('#FF3333').setTitle(`❌ Event Host Application: DENIED`).addFields({ name: `🛠️ __DISPOSITION__`, value: `* **Rejected By:** ${staffInteraction.user}`, inline: false });
                            await staffInteraction.update({ embeds: [declined], components: [] });
                            logCollector.stop();
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }
}
