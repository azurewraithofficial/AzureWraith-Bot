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
    .setDescription('Recruitment operations and staff recruitment infrastructure.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('panel')
            .setDescription('Deploys the persistent staff onboarding application portal.')
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
            .setTitle(`${emoji.staff} Azure Wraith Administrative Recruitment Portal`)
            .setDescription('>>> Looking to help protect, moderate, and optimize our server infrastructure? We are looking for mature, dedicated individuals to step up and join our server operations team.')
            .addFields(
                {
                    name: `${emoji.member} __CANDIDATE EXPECTATIONS__`,
                    value: 
                        `* Must maintain an active, clean moderation profile history without recent bans.\n` +
                        `* Possess deep working knowledge of our network regulations and staff code.\n` +
                        `* Remain cool-headed under crisis and handle support pipelines professionally.`,
                    inline: false
                },
                {
                    name: `${emoji.warning} __SUBMISSION PROTOCOLS__`,
                    value: 
                        `* Provide authentic data, precise age brackets, and transparent history records.\n` +
                        `* Application evaluation parameters may scale up to 72 hours for review cycles.`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.mark} **Click the form link below to open a secure applicant profile file.**`,
                    inline: false
                }
            )
            .setTimestamp();

        const panelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_apply_modal')
                .setLabel('Submit Staff Application')
                .setEmoji('1509557210861142186')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.channel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({ content: 'The staff recruitment portal has been deployed successfully.', ephemeral: true });

        const panelCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button });

        panelCollector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'trigger_apply_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('staff_apply_modal')
                    .setTitle('Staff Recruitment Onboarding Form');

                const ageInput = new TextInputBuilder()
                    .setCustomId('app_field_age')
                    .setLabel('What is your Age & Timezone?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 19 Years Old | EST Timezone')
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('app_field_exp')
                    .setLabel('Detail your previous staff experience.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('List any past servers, positions held, or relevant management fields...')
                    .setRequired(true);

                const motivationInput = new TextInputBuilder()
                    .setCustomId('app_field_motive')
                    .setLabel('Why should we select you over others?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Explain what value you provide to our administrative operations network...')
                    .setRequired(true);

                const availabilityInput = new TextInputBuilder()
                    .setCustomId('app_field_time')
                    .setLabel('Weekly dedication allocation hours?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 15-20 Hours weekly / Variable availability')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(ageInput),
                    new ActionRowBuilder().addComponents(experienceInput),
                    new ActionRowBuilder().addComponents(motivationInput),
                    new ActionRowBuilder().addComponents(availabilityInput)
                );

                await btnInteraction.showModal(modal);

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
                    if (!targetReviewChannel) return modalSubmit.editReply({ content: `${emoji.warning} The review channel pipeline could not be established.` });

                    const reviewEmbed = new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`${emoji.staff} Pending Staff Application File`)
                        .setDescription(`>>> A new candidate profile has been registered from the recruitment interface. Evaluate data profiles thoroughly before dispatching resolution keys.`)
                        .addFields(
                            { name: `${emoji.member} __APPLICANT IDENTITY__`, value: `* **User Account:** ${modalSubmit.user} (${modalSubmit.user.tag})\n* **Account ID:** \`${modalSubmit.user.id}\``, inline: true },
                            { name: `📊 __METRIC BIOMETRICS__`, value: `* **Age & Zone:** \`${inputAge}\`\n* **Dedication Range:** \`${inputTime}\``, inline: true },
                            { name: `${emoji.bell} __PREVIOUS EVALUATION RECORD__`, value: `\`\`\`\n${inputExp}\n\`\`\``, inline: false },
                            { name: `${emoji.mark} __CORE MOTIVATION MATRIX__`, value: `\`\`\`\n${inputMotive}\n\`\`\``, inline: false }
                        )
                        .setTimestamp();

                    const reviewActionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('staff_app_accept').setLabel('Accept Candidate').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('staff_app_decline').setLabel('Decline Candidate').setStyle(ButtonStyle.Danger)
                    );

                    const staffLogMessage = await targetReviewChannel.send({ embeds: [reviewEmbed], components: [reviewActionRow] });

                    await modalSubmit.editReply({
                        embeds: [new EmbedBuilder().setColor('#007FFF').setTitle(`${emoji.mark} Application Profile Dispatched`).setDescription(`>>> Your structural staff application files have been compiled, locked, and routed successfully.`)]
                    });

                    const staffLogCollector = staffLogMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

                    staffLogCollector.on('collect', async (staffInteraction) => {
                        if (!staffInteraction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                            return staffInteraction.reply({ content: 'Access Restriction. Elevated administrative clearances required.', ephemeral: true });
                        }

                        if (staffInteraction.customId === 'staff_app_accept') {
                            const acceptedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#44FF44')
                                .setTitle(`${emoji.mark} Staff Application Profile: APPROVED`)
                                .addFields({ name: `${emoji.staff} __RECRUITMENT ACTION CASE__`, value: `* **Processed By:** ${staffInteraction.user}\n* **Result:** Candidate Profile Passed.`, inline: false });
                            await staffInteraction.update({ embeds: [acceptedEmbed], components: [] });
                            staffLogCollector.stop();
                        } else if (staffInteraction.customId === 'staff_app_decline') {
                            const declinedEmbed = EmbedBuilder.from(staffLogMessage.embeds[0])
                                .setColor('#FF3333')
                                .setTitle(`${emoji.warning} Staff Application Profile: DENIED`)
                                .addFields({ name: `${emoji.staff} __RECRUITMENT ACTION CASE__`, value: `* **Processed By:** ${staffInteraction.user}\n* **Result:** Profile Archive Closed.`, inline: false });
                            await staffInteraction.update({ embeds: [declinedEmbed], components: [] });
                            staffLogCollector.stop();
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }
}
