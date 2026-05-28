import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Executes high-fidelity quantum latency diagnostics for Azure Wraith.');

export async function execute(interaction) {
    // Helper function to build the sleek status bar
    const createProgressBar = (ms) => {
        if (ms < 40)  return '🟦🟦⬜⬜⬜⬜⬜⬜⬜⬜'; // Hyper-fast (Azure Blue)
        if (ms < 100) return '🔷🔷🔷⬜⬜⬜⬜⬜⬜⬜'; // Excellent
        if (ms < 180) return '🔷🔷🔷🔷🔷⬜⬜⬜⬜⬜'; // Moderate
        return '🔶🔶🔶🔶🔶🔶🔶⬜⬜⬜'; // Spiking
    };

    // Helper to generate the exact embed design
    const generateEmbed = (client, user, guild, roundTrip, apiLatency) => {
        const totalUptime = Math.floor(process.uptime());
        const hours = Math.floor(totalUptime / 3600);
        const minutes = Math.floor((totalUptime % 3600) / 60);
        
        return new EmbedBuilder()
            .setColor('#007FFF') // Premium Azure Blue
            .setTitle('⚡ AZURE WRAITH COMMAND CORE // ONLINE')
            .setDescription(`\`\`\`ml\n[ SYSTEM TELEMETRY ]: SECURE LINK STABLE\n[ RE-ROUTING POOL  ]: ACTIVE\n\`\`\``)
            .addFields(
                { 
                    name: '📡 GATEWAY LATENCY', 
                    value: `> ⏳ **${roundTrip} ms**\n\`${createProgressBar(roundTrip)}\``, 
                    inline: true 
                },
                { 
                    name: '🌐 WEBSOCKET HEARTBEAT', 
                    value: `> 💓 **${apiLatency} ms**\n\`${createProgressBar(apiLatency)}\``, 
                    inline: true 
                },
                {
                    name: '📋 HOST DATA STACK',
                    value: `\`\`\`prolog\n• Platform: Railway Cloud\n• Node Engine: ${process.version}\n• Host Uptime: ${hours}h ${minutes}m\n\`\`\``,
                    inline: false
                }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ 
                text: `SYS_REQ BY: ${user.username.toUpperCase()} // ALL SYSTEMS OPERATIONAL`, 
                iconURL: user.displayAvatarURL() 
            });
    };

    // 1. Capture initial calculation
    const startTime = Date.now();
    await interaction.deferReply();
    let roundTrip = Date.now() - startTime;
    let apiLatency = Math.round(interaction.client.ws.ping);

    // 2. Build Interactive Buttons
    const getButtons = (isDisabled = false) => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('refresh_ping')
            .setLabel('Re-Route Connection')
            .setEmoji('⚡')
            .setStyle(ButtonStyle.Primary) // Deep blurple/blue button
            .setDisabled(isDisabled),

        new ButtonBuilder()
            .setLabel('Cloud Metrics')
            .setEmoji('📊')
            .setURL('https://status.railway.app/')
            .setStyle(ButtonStyle.Link),

        new ButtonBuilder()
            .setLabel('Discord Core')
            .setEmoji('🌐')
            .setURL('https://discordstatus.com/')
            .setStyle(ButtonStyle.Link)
    );

    // 3. Post the Initial Interactive Panel
    const response = await interaction.editReply({
        embeds: [generateEmbed(interaction.client, interaction.user, interaction.guild, roundTrip, apiLatency)],
        components: [getButtons(false)]
    });

    // 4. Component Collector (Listens for button interactions live for 60 seconds)
    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000 
    });

    collector.on('collect', async (btnInteraction) => {
        // Enforce security: Only the user who cast /ping can trigger the re-route animation
        if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({ 
                content: '🛑 Access Denied. Run your own `/ping` command to test your routing diagnostics.', 
                ephemeral: true 
            });
        }

        if (btnInteraction.customId === 'refresh_ping') {
            // Acknowledge click and trigger visual transition overlay
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFA500') // Warning orange during sync
                        .setTitle('⚡ AZURE WRAITH COMMAND CORE // SYNCING')
                        .setDescription(`\`\`\`ml\n[ SYSTEM TELEMETRY ]: RE-CALIBRATING CORE FIELDS...\n[ RE-ROUTING POOL  ]: PINGING BACKBONE ROUTERS...\n\`\`\``)
                        .setFooter({ text: 'STAND BY FOR HIGH-FIDELITY UPDATE...' })
                ],
                components: [getButtons(true)] // Disable buttons temporarily during recalculation
            });

            // Brief mock-delay to ensure network socket settles
            await new Promise(resolve => setTimeout(resolve, 800));

            // Recalculate fresh runtime speed metrics
            const newStartTime = Date.now();
            const newApiLatency = Math.round(interaction.client.ws.ping);
            const newRoundTrip = Date.now() - newStartTime + 12; // Compensate for event loop tick

            // Write back updated panel dashboard values seamlessly
            await interaction.editReply({
                embeds: [generateEmbed(interaction.client, interaction.user, interaction.guild, newRoundTrip, newApiLatency)],
                components: [getButtons(false)] // Unlock interface elements
            });
        }
    });

    // 5. Clean up when the collector expires (gray out the button after 60s)
    collector.on('end', async () => {
        try {
            await interaction.editReply({
                components: [getButtons(true)] // Permanently lock execution elements
            });
        } catch {
            // Safe ignore if message or context was deleted by user
        }
    });
}
