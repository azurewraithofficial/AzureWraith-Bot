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
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
    };

    const PARTNER_REVIEW_CHANNEL_ID = '1508525293512429740';
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'panel') {
        const panelEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`🤝 Strategic Alliances & Partnerships`)
            .setDescription('>>> Looking to merge community target demographics, execute brand cross-promotions, or inter-link infrastructure nodes? Submit an official Partnership profile packet below.')
            .addFields(
                {
                    name: `📊 __MINIMUM SYSTEM REQUIREMENT MATRIX__`,
                    value: 
                        `* Community hub environments must closely follow general Discord Terms of Service.\n` +
                        `* Must host an active baseline audience without fabricated bot presence.\n` +
                        `* Requires a designated representative or owner inside our platform layout.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.mark} **Click the form link below to file your server credentials.**`,
                    inline: false
                }
            )
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_partner_modal')
                .setLabel('Request Partnership')
                .setEmoji('🤝')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ content: 'Partnership submission matrix successfully initialized.', ephemeral: true });

        const panelCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_partner_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('partner_apply_modal')
                    .setTitle('Partnership Information Grid');

                const nameInput = new TextInputBuilder()
                    .setCustomId('pt_field_name')
                    .setLabel('Community Name & Main Direct Link?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., Azure Network | discord.gg/example')
                    .setRequired(true);

                const sizeInput = new TextInputBuilder()
                    .setCustomId('pt_field_size')
                    .setLabel('Total Member Count & Daily Activity Level?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 2,400 members | High text frequency')
                    .setRequired(true);

                const contextInput = new TextInputBuilder()
                    .setCustomId('pt_field_context')
                    .setLabel('Describe your server & focus area.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('What is your theme? Gaming, technology, development, etc...')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nameInput),
                    new ActionRowBuilder().addComponents(sizeInput),
                    new ActionRowBuilder().addComponents(contextInput)
                );

                await btnInteraction.showModal(modal);

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
                    if (!targetReviewChannel) return modalSubmit.editReply({ content: `${emoji.warning} Partnership destination logging pipeline dropped.` });

                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`🤝 Strategic Partnership Evaluation`)
                        .setDescription(`>>> A new network expansion candidate profile has requested cross-promotional clearance.`)
                        .addFields(
                            { name: `${emoji.member} __REPRESENTATIVE INFO__`, value: `* **User:** ${modalSubmit.user}\n* **ID:** \`${modalSubmit.user.id}\``, inline: true },
                            { name: `📈 __NETWORK PROFILE__`, value: `* **Asset Identity:** \`${inputName}\`\n* **Reported Size:** \`${inputSize}\``, inline: true },
                            { name: `📝 __TARGET BRAND VALUE DESCRIPTION__`, value: `\`\`\`\n${inputContext}\n\`\`\``, inline: false }
                        )
                        .setTimestamp();

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('pt_app_accept').setLabel('Accept Partner').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('pt_app_decline').setLabel('Decline Partner').setStyle(ButtonStyle.Danger)
                    );

                    const reviewLog = await targetReviewChannel.send({ embeds: [reviewEmbed], components: [actionRow] });

                    await modalSubmit.editReply({
                        embeds: [new EmbedBuilder().setColor('#007FFF').setDescription(`${emoji.mark} **Partnership request submitted successfully.** Our operations desk has locked your file for processing.`)]
                    });

                    const logCollector = reviewLog.createMessageComponentCollector({ componentType: ComponentType.Button });

                    logCollector.on('collect', async (staffInteraction) => {
                        if (!staffInteraction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                            return staffInteraction.reply({ content: 'Elevated administrative clearances required.', ephemeral: true });
                        }

                        if (staffInteraction.customId === 'pt_app_accept') {
                            const accepted = EmbedBuilder.from(reviewLog.embeds[0]).setColor('#44FF44').setTitle(`🤝 Alliance Established: APPROVED`).addFields({ name: `🛠️ __DISPOSITION__`, value: `* **Approved By:** ${staffInteraction.user}`, inline: false });
                            await staffInteraction.update({ embeds: [accepted], components: [] });
                            logCollector.stop();
                        } else if (staffInteraction.customId === 'pt_app_decline') {
                            const declined = EmbedBuilder.from(reviewLog.embeds[0]).setColor('#FF3333').setTitle(`❌ Alliance Request: DENIED`).addFields({ name: `🛠️ __DISPOSITION__`, value: `* **Rejected By:** ${staffInteraction.user}`, inline: false });
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
