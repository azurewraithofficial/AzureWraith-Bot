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

// ────────────────────────────────────────────────────────────────────────
// PURE JAVASCRIPT TIME CONVERSION MATRIX (Replaces 'ms' package)
// ────────────────────────────────────────────────────────────────────────
function parseDuration(str) {
    if (!str) return null;
    const matches = str.toLowerCase().match(/^(\d+)([smhd])$/);
    if (!matches) return null;
    
    const value = parseInt(matches[1], 10);
    const unit = matches[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

export const data = new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Initialize a high-stakes server giveaway with role weightage.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Configuration for a new giveaway instance.')
            .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g., 10s, 30m, 1h, 1d)').setRequired(true))
            .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners to be selected').setMinValue(1).setMaxValue(20).setRequired(true))
            .addRoleOption(opt => opt.setName('requirement').setDescription('Required role to enter the giveaway').setRequired(false))
            // Extra Entry Configuration Grid (Max 5 roles, max 30 entries capped)
            .addRoleOption(opt => opt.setName('extra_role_1').setDescription('Bonus Entry Role #1').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_1').setDescription('Bonus weight (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            
            .addRoleOption(opt => opt.setName('extra_role_2').setDescription('Bonus Entry Role #2').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_2').setDescription('Bonus weight (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            
            .addRoleOption(opt => opt.setName('extra_role_3').setDescription('Bonus Entry Role #3').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_3').setDescription('Bonus weight (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            
            .addRoleOption(opt => opt.setName('extra_role_4').setDescription('Bonus Entry Role #4').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_4').setDescription('Bonus weight (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            
            .addRoleOption(opt => opt.setName('extra_role_5').setDescription('Bonus Entry Role #5').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_5').setDescription('Bonus weight (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

export async function execute(interaction) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>',
        gift: '🎁'
    };

    if (interaction.options.getSubcommand() === 'create') {
        const durationInput = interaction.options.getString('duration');
        const winnerCount = interaction.options.getInteger('winners');
        const requiredRole = interaction.options.getRole('requirement');
        
        // Execute internal string parsing engine
        const durationMs = parseDuration(durationInput);

        if (!durationMs) {
            return interaction.reply({ 
                content: `${emoji.warning} Format Exception: Invalid timeframe format string. Use syntax markers like \`30s\`, \`15m\`, \`2h\`, or \`1d\`.`, 
                ephemeral: true 
            });
        }

        // Parse Bonus Entry Allocation Arrays
        const extraEntries = [];
        for (let i = 1; i <= 5; i++) {
            const role = interaction.options.getRole(`extra_role_${i}`);
            const amt = interaction.options.getInteger(`extra_amt_${i}`);
            if (role && amt) extraEntries.push({ roleId: role.id, bonus: amt });
        }

        // ────────────────────────────────────────────────────────────────────────
        // 1. MODAL CAPTURE DIALOGUE
        // ────────────────────────────────────────────────────────────────────────
        const modal = new ModalBuilder()
            .setCustomId('giveaway_modal')
            .setTitle('Giveaway Content Configuration');

        const titleInput = new TextInputBuilder()
            .setCustomId('giveaway_title')
            .setLabel('Giveaway Title / Prize Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., Premium Discord Nitro (1 Year)')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('giveaway_desc')
            .setLabel('Giveaway Description / Context')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide the specifications, sponsor mentions, and description detail here...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);

        const modalSubmit = await interaction.awaitModalSubmit({ time: 300000 }).catch(() => null);
        if (!modalSubmit) return;

        const title = modalSubmit.fields.getTextInputValue('giveaway_title');
        const description = modalSubmit.fields.getTextInputValue('giveaway_desc');
        const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);

        // ────────────────────────────────────────────────────────────────────────
        // 2. EMBED DISPLAY SCHEMATIC
        // ────────────────────────────────────────────────────────────────────────
        const giveawayEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.gift} ${title}`)
            .setDescription(`>>> ${description}`)
            .addFields(
                { 
                    name: `${emoji.bell} __GIVEAWAY DETAILS__`, 
                    value: `* **Ends:** <t:${endTimestamp}:R> (<t:${endTimestamp}:f>)\n* **Winners:** \`${winnerCount}\`\n* **Hosted By:** ${interaction.user}`, 
                    inline: false 
                }
            );

        if (requiredRole) {
            giveawayEmbed.addFields({ name: `${emoji.warning} __REQUIREMENTS__`, value: `* Must possess the ${requiredRole} role to qualify.`, inline: true });
        }

        if (extraEntries.length > 0) {
            const entryText = extraEntries.map(e => `* <@&${e.roleId}>: **+${e.bonus}** Entries`).join('\n');
            giveawayEmbed.addFields({ name: `${emoji.mark} __BONUS ENTRIES__`, value: entryText, inline: true });
        }

        giveawayEmbed.setTimestamp();

        const enterButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_enter')
                .setLabel('Enter Giveaway')
                .setEmoji('1509557248534253568') // Verified Mark Emoji
                .setStyle(ButtonStyle.Primary)
        );

        const msg = await modalSubmit.reply({
            embeds: [giveawayEmbed],
            components: [enterButton],
            fetchReply: true
        });

        const participants = new Set();

        // ────────────────────────────────────────────────────────────────────────
        // 3. CAPTURE LOGIC PIPELINE
        // ────────────────────────────────────────────────────────────────────────
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: durationMs });

        collector.on('collect', async (btn) => {
            if (requiredRole && !btn.member.roles.cache.has(requiredRole.id)) {
                return btn.reply({ content: `${emoji.warning} Access Denied: You do not have the ${requiredRole} role required to enter.`, ephemeral: true });
            }

            if (participants.has(btn.user.id)) {
                return btn.reply({ content: `${emoji.bell} You have already registered your entry in this giveaway database.`, ephemeral: true });
            }

            participants.add(btn.user.id);
            await btn.reply({ content: `${emoji.mark} Your entry has been successfully logged. Good luck!`, ephemeral: true });
        });

        collector.on('end', async () => {
            const pool = [];
            
            // Multiplier Probability Math Processing Loop
            for (const userId of participants) {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) continue;

                let entries = 1; // Base Entry Matrix Allocation
                extraEntries.forEach(config => {
                    if (member.roles.cache.has(config.roleId)) {
                        entries += config.bonus;
                    }
                });

                for (let i = 0; i < entries; i++) {
                    pool.push(userId);
                }
            }

            const winners = [];
            if (pool.length > 0) {
                for (let i = 0; i < winnerCount; i++) {
                    if (pool.length === 0) break;
                    const winnerId = pool[Math.floor(Math.random() * pool.length)];
                    winners.push(`<@${winnerId}>`);
                    
                    // Purge selected winner tokens from matrix to bypass double-selection anomalies
                    while(pool.indexOf(winnerId) !== -1) { 
                        pool.splice(pool.indexOf(winnerId), 1); 
                    }
                }
            }

            // ────────────────────────────────────────────────────────────────────────
            // 4. CONCLUSION FIELD RENDERING
            // ────────────────────────────────────────────────────────────────────────
            const resultEmbed = EmbedBuilder.from(giveawayEmbed)
                .setColor(winners.length > 0 ? '#007FFF' : '#777777')
                .setTitle(`${emoji.gift} Giveaway Concluded`)
                .setFields(
                    { name: `${emoji.staff} __FINAL RESULTS__`, value: winners.length > 0 ? `* **Winners:** ${winners.join(', ')}` : '* **Winners:** No valid participants.', inline: false },
                    { name: '───────────────', value: `${emoji.member} A total of **${participants.size}** users attempted entry.`, inline: false }
                );

            await msg.edit({ embeds: [resultEmbed], components: [] });

            if (winners.length > 0) {
                await msg.reply({ content: `🎊 Congratulations to the winners: ${winners.join(', ')}!` });
            }
        });
    }
}
