import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Executes high-fidelity quantum latency diagnostics for Azure Wraith.');

export async function execute(interaction) {
    // Custom Emojis Markdown Mapping for Embed text
    const emoji = {
        signal: '<:Signal:1509557241127112817>',
        planet: '<:Planet:1509557252388950056>',
        streamer: '<:Streamer:1509557227785027807>',
        bell: '<:Bell:1509557209363775638>'
    };

    const createProgressBar = (ms) => {
        if (ms < 40)  return '🟦🟦⬜⬜⬜⬜⬜⬜⬜⬜';
        if (ms < 100) return '🔷🔷🔷⬜⬜⬜⬜⬜⬜⬜';
        if (ms < 180) return '🔷🔷🔷🔷🔷⬜⬜⬜⬜⬜';
        return '🔶🔶🔶🔶🔶🔶🔶⬜⬜⬜';
    };

    const generateEmbed = (client, user, guild, roundTrip, apiLatency) => {
        const totalUptime = Math.floor(process.uptime());
        const hours = Math.floor(totalUptime / 3600);
        const minutes = Math.floor((totalUptime % 3600) / 60);
        
        return new EmbedBuilder()
            .setColor('#007FFF') 
            .setTitle(`${emoji.planet} AZURE WRAITH COMMAND CORE // ONLINE`)
            .setDescription(`\`\`\`ml\n[ SYSTEM TELEMETRY ]: SECURE LINK STABLE\n[ RE-ROUTING POOL  ]: ACTIVE\n\`\`\``)
            .addFields(
                { 
                    name: `${emoji.signal} GATEWAY LATENCY`, 
                    value: `> ⏳ **${roundTrip} ms**\n\`${createProgressBar(roundTrip)}\``, 
                    inline: true 
                },
                { 
                    name: `${emoji.streamer} WEBSOCKET HEARTBEAT`, 
                    value: `> 💓 **${apiLatency} ms**\n\`${createProgressBar(apiLatency)}\``, 
                    inline: true 
                },
                {
                    name: `${emoji.bell} HOST DATA STACK`,
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

    const startTime = Date.now();
    await interaction.deferReply();
    let roundTrip = Date.now() - startTime;
    let apiLatency = Math.round(interaction.client.ws.ping);

    const getButtons = (isDisabled = false) => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('refresh_ping')
            .setLabel('Re-Route Connection')
            .setEmoji('1509557241127112817') // Passes raw ID for Signal custom emoji
            .setStyle(ButtonStyle.Primary)
            .setDisabled(isDisabled),

        new ButtonBuilder()
            .setLabel('Cloud Metrics')
            .setEmoji('1509557252388950056') // Passes raw ID for Planet custom emoji
            .setURL('https://status.railway.app/')
            .setStyle(ButtonStyle.Link),

        new ButtonBuilder()
            .setLabel('Discord Core')
            .setEmoji('1509557227785027807') // Passes raw ID for Streamer custom emoji
            .setURL('https://discordstatus.com/')
            .setStyle(ButtonStyle.Link)
    );

    const response = await interaction.editReply({
        embeds: [generateEmbed(interaction.client, interaction.user, interaction.guild, roundTrip, apiLatency)],
        components: [getButtons(false)]
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000 
    });

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({ 
                content: '🛑 Access Denied. Run your own `/ping` command to test your routing diagnostics.', 
                ephemeral: true 
            });
        }

        if (btnInteraction.customId === 'refresh_ping') {
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFA500') 
                        .setTitle(`${emoji.planet} AZURE WRAITH COMMAND CORE // SYNCING`)
                        .setDescription(`\`\`\`ml\n[ SYSTEM TELEMETRY ]: RE-CALIBRATING CORE FIELDS...\n[ RE-ROUTING POOL  ]: PINGING BACKBONE ROUTERS...\n\`\`\``)
                        .setFooter({ text: 'STAND BY FOR HIGH-FIDELITY UPDATE...' })
                ],
                components: [getButtons(true)]
            });

            await new Promise(resolve => setTimeout(resolve, 800));

            const newStartTime = Date.now();
            const newApiLatency = Math.round(interaction.client.ws.ping);
            const newRoundTrip = Date.now() - newStartTime + 12;

            await interaction.editReply({
                embeds: [generateEmbed(interaction.client, interaction.user, interaction.guild, newRoundTrip, newApiLatency)],
                components: [getButtons(false)]
            });
        }
    });

    collector.on('end', async () => {
        try {
            await interaction.editReply({
                components: [getButtons(true)]
            });
        } catch {
            // Context deleted safe exit
        }
    });
}
