import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Displays the network diagnostic panel for Azure Wraith.');

export async function execute(interaction) {
    // Custom Emojis - Using your ID mappings
    const emoji = {
        title: '<:planet:1509557252388950056>',
        gateway: '<:signal:1509557241127112817>',
        api: '<:streamer:1509557227785027807>',
        meta: '<:bell:1509557209363775638>'
    };

    // Clean, minimalist embed builder function
    const generateEmbed = (client, user, roundTrip, apiLatency) => {
        return new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.title} Azure Wraith Network Diagnostics`)
            .setDescription('Current connectivity status and heartbeat performance metrics for the core application clusters.')
            .addFields(
                { 
                    name: `${emoji.gateway} Gateway Latency`, 
                    value: `\`\`\`ansi\n\u001b[1;34m${roundTrip}ms\u001b[0m\n\`\`\``, 
                    inline: true 
                },
                { 
                    name: `${emoji.api} WebSocket API`, 
                    value: `\`\`\`ansi\n\u001b[1;34m${apiLatency}ms\u001b[0m\n\`\`\``, 
                    inline: true 
                },
                { 
                    name: '───────────────', 
                    value: `${emoji.meta} **Environment:** Railway Cloud Engine\n⏱️ **Process Lifecycle:** Running smoothly`, 
                    inline: false 
                }
            )
            .setTimestamp();
    };

    // 1. Initial performance metrics check
    const startTime = Date.now();
    await interaction.deferReply();
    let roundTrip = Date.now() - startTime;
    let apiLatency = Math.round(interaction.client.ws.ping);

    // 2. Setup standard Discord component buttons
    const getButtons = (isDisabled = false) => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('refresh_ping')
            .setLabel('Refresh Panel')
            .setEmoji('1509557241127112817') // Signal Emoji ID
            .setStyle(ButtonStyle.Secondary) // Charcoal gray button for a cleaner appearance
            .setDisabled(isDisabled),

        new ButtonBuilder()
            .setLabel('Railway Status')
            .setURL('https://status.railway.app/')
            .setStyle(ButtonStyle.Link),

        new ButtonBuilder()
            .setLabel('Discord Status')
            .setURL('https://discordstatus.com/')
            .setStyle(ButtonStyle.Link)
    );

    // 3. Post Initial Minimalist Panel
    const response = await interaction.editReply({
        embeds: [generateEmbed(interaction.client, interaction.user, roundTrip, apiLatency)],
        components: [getButtons(false)]
    });

    // 4. Interaction Collector
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 45000 
    });

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({ 
                content: 'This diagnostic panel belongs to another administrator.', 
                ephemeral: true 
            });
        }

        if (btnInteraction.customId === 'refresh_ping') {
            // Start timing BEFORE the network request to capture actual gateway round-trip latency
            const newStartTime = Date.now();

            // Put panel into a clean loading state
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#007FFF')
                        .setTitle(`${emoji.title} Azure Wraith Network Diagnostics`)
                        .setDescription('*Recalibrating routing nodes and fetching fresh API latency logs...*')
                ],
                components: [getButtons(true)]
            });

            // Smooth latency recalculation based on the update action's network duration
            const newRoundTrip = Date.now() - newStartTime;
            const newApiLatency = Math.round(interaction.client.ws.ping);

            await interaction.editReply({
                embeds: [generateEmbed(interaction.client, interaction.user, newRoundTrip, newApiLatency)],
                components: [getButtons(false)]
            });
        }
    });

    // 5. Clean termination
    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [getButtons(true)] });
        } catch {
            // Context vanished safely
        }
    });
}
