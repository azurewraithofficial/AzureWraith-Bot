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
// CORE UTILITY: TEMPORAL PARSING ENGINE
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
    .setDescription('Initialize a high-stakes automated network yield distribution.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Deploy a new algorithmic giveaway matrix.')
            .addStringOption(opt => opt.setName('duration').setDescription('Temporal window (e.g., 10s, 30m, 1h, 1d)').setRequired(true))
            .addIntegerOption(opt => opt.setName('winners').setDescription('Total beneficiary capacity').setMinValue(1).setMaxValue(20).setRequired(true))
            .addRoleOption(opt => opt.setName('requirement').setDescription('Security protocol: Mandatory role for entry').setRequired(false))
            // Advanced Multiplier Grid Configuration
            .addRoleOption(opt => opt.setName('extra_role_1').setDescription('Algorithmic Bonus Node #1').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_1').setDescription('Weight parameter (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            .addRoleOption(opt => opt.setName('extra_role_2').setDescription('Algorithmic Bonus Node #2').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_2').setDescription('Weight parameter (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            .addRoleOption(opt => opt.setName('extra_role_3').setDescription('Algorithmic Bonus Node #3').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_3').setDescription('Weight parameter (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            .addRoleOption(opt => opt.setName('extra_role_4').setDescription('Algorithmic Bonus Node #4').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_4').setDescription('Weight parameter (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
            .addRoleOption(opt => opt.setName('extra_role_5').setDescription('Algorithmic Bonus Node #5').setRequired(false))
            .addIntegerOption(opt => opt.setName('extra_amt_5').setDescription('Weight parameter (Max 30)').setMinValue(1).setMaxValue(30).setRequired(false))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

export async function execute(interaction) {
    // Custom High-Fidelity Emoji Vector Asset Matrix
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>',
        gift: '🎁' // Replace with custom high-res box if available
    };

    if (interaction.options.getSubcommand() === 'create') {
        const durationInput = interaction.options.getString('duration');
        const winnerCount = interaction.options.getInteger('winners');
        const requiredRole = interaction.options.getRole('requirement');
        
        const durationMs = parseDuration(durationInput);

        if (!durationMs) {
            return interaction.reply({ 
                content: `${emoji.warning} **System Exception:** Invalid temporal format string. Utilize exact syntax markers [\`30s\`, \`15m\`, \`2h\`, \`1d\`].`, 
                ephemeral: true 
            });
        }

        // Index Algorithmic Bonus Entries
        const extraEntries = [];
        for (let i = 1; i <= 5; i++) {
            const role = interaction.options.getRole(`extra_role_${i}`);
            const amt = interaction.options.getInteger(`extra_amt_${i}`);
            if (role && amt) extraEntries.push({ roleId: role.id, bonus: amt });
        }

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 1: CONFIGURATION MODAL (DATA INJECTION)
        // ────────────────────────────────────────────────────────────────────────
        const modal = new ModalBuilder()
            .setCustomId('giveaway_modal')
            .setTitle('Yield Distribution Data Link');

        const titleInput = new TextInputBuilder()
            .setCustomId('giveaway_title')
            .setLabel('Target Asset Identity / Prize Payload')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., Premium Network Access // 1-Year Nitro')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('giveaway_desc')
            .setLabel('Contextual Operations Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Inject item specifications, sponsor credits, and visual formatting here...')
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
        // PHASE 2: ACTIVE DEPLOYMENT RENDERING (LIVE MATRIX)
        // ────────────────────────────────────────────────────────────────────────
        const giveawayEmbed = new EmbedBuilder()
            .setColor('#00E5FF') // Cyber Neon Cyan
            .setTitle(`${emoji.gift} SYSTEM CORE // YIELD DISTRIBUTION ACTIVE`)
            .setDescription(`>>> **TARGET ASSET:** \`${title}\`\n\n${description}`)
            .addFields(
                { 
                    name: `${emoji.bell} ── TEMPORAL METRICS`, 
                    value: `* **Resolution Phase:** <t:${endTimestamp}:R> (<t:${endTimestamp}:f>)\n* **Allocated Beneficiaries:** \`${winnerCount}\`\n* **Hosted By:** ${interaction.user}`, 
                    inline: false 
                }
            );

        if (requiredRole) {
            giveawayEmbed.addFields({ 
                name: `${emoji.warning} ── SECURITY PROTOCOLS`, 
                value: `* Target requires **${requiredRole}** network clearance for valid participation.`, 
                inline: true 
            });
        }

        if (extraEntries.length > 0) {
            const entryText = extraEntries.map(e => `* <@&${e.roleId}> ➾ **+${e.bonus} Network Value**`).join('\n');
            giveawayEmbed.addFields({ 
                name: `📈 ── ALGORITHMIC MULTIPLIERS`, 
                value: entryText, 
                inline: true 
            });
        }

        giveawayEmbed
            .setFooter({ text: 'Azure Wraith Operations • Data Link Active & Verifying Entries' })
            .setTimestamp();

        const enterButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_enter')
                .setLabel('Authorize Entry Protocol')
                .setEmoji('1509557248534253568') // Verified mark
                .setStyle(ButtonStyle.Success)
        );

        const msg = await modalSubmit.reply({
            embeds: [giveawayEmbed],
            components: [enterButton],
            fetchReply: true
        });

        const participants = new Set();

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 3: LIVE EVENT COLLECTOR (NODE INGESTION)
        // ────────────────────────────────────────────────────────────────────────
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: durationMs });

        collector.on('collect', async (btn) => {
            if (requiredRole && !btn.member.roles.cache.has(requiredRole.id)) {
                return btn.reply({ 
                    content: `${emoji.warning} **Access Denied:** Insufficient clearance. You lack the ${requiredRole} network tag.`, 
                    ephemeral: true 
                });
            }

            if (participants.has(btn.user.id)) {
                return btn.reply({ 
                    content: `${emoji.bell} **Redundant Request:** Your node is already registered in the distribution matrix.`, 
                    ephemeral: true 
                });
            }

            participants.add(btn.user.id);
            await btn.reply({ 
                content: `${emoji.mark} **Connection Established:** Your entry profile has been successfully ingested into the draw array.`, 
                ephemeral: true 
            });
        });

        // ────────────────────────────────────────────────────────────────────────
        // PHASE 4: RESOLUTION SEQUENCE (MATHEMATICAL DISPOSITION)
        // ────────────────────────────────────────────────────────────────────────
        collector.on('end', async () => {
            const pool = [];
            
            // Weight Distribution & Probability Allocation Loop
            for (const userId of participants) {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) continue;

                let entries = 1; // Base algorithmic weight
                extraEntries.forEach(config => {
                    if (member.roles.cache.has(config.roleId)) {
                        entries += config.bonus;
                    }
                });

                // Inject redundant tokens for weighted probability
                for (let i = 0; i < entries; i++) {
                    pool.push(userId);
                }
            }

            const winners = [];
            if (pool.length > 0) {
                for (let i = 0; i < winnerCount; i++) {
                    if (pool.length === 0) break;
                    
                    // Secure RNG Selection
                    const winnerId = pool[Math.floor(Math.random() * pool.length)];
                    winners.push(`<@${winnerId}>`);
                    
                    // Recursive array purge to nullify duplicate beneficiary overlaps
                    while(pool.indexOf(winnerId) !== -1) { 
                        pool.splice(pool.indexOf(winnerId), 1); 
                    }
                }
            }

            // Generate Archival Result Matrix
            const resultEmbed = EmbedBuilder.from(giveawayEmbed)
                .setColor(winners.length > 0 ? '#00FF7F' : '#333333') // Success Green or Dead Grey
                .setTitle(`📦 SYSTEM CORE // YIELD DISTRIBUTION CONCLUDED`)
                .setDescription(`>>> **ASSET ALLOCATED:** \`${title}\`\n\nThe temporal window has collapsed and algorithms have finalized the pool.`)
                .setFields(
                    { 
                        name: `${emoji.staff} ── DISPOSITION RESULTS`, 
                        value: winners.length > 0 ? `* **Authorized Beneficiaries:**\n${winners.join(', ')}` : '* **Status:** Critical Null — No valid participants logged.', 
                        inline: false 
                    },
                    { 
                        name: `📊 ── NETWORK TELEMETRY`, 
                        value: `* A total of **${participants.size}** distinct network IDs attempted access.`, 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Azure Wraith Operations • Event Matrix Archived' });

            await msg.edit({ embeds: [resultEmbed], components: [] });

            // Global Broadcast Payload
            if (winners.length > 0) {
                await msg.reply({ 
                    content: `${emoji.mark} **YIELD DISPERSED:** Clearances verified for ${winners.join(', ')}. Please open a network ticket to claim your asset.` 
                });
            }
        });
    }
}
