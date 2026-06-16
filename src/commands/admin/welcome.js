import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

// Global cache storage layer initialization
if (!global.welcomeConfig) {
    global.welcomeConfig = {
        enabled: false,
        channelId: null
    };
}

export const data = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure or deactivate the server automated welcome interface matrix.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('enable')
            .setDescription('Activates the automated welcoming system framework.')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The text channel where welcome card profiles will be deployed.')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('disable')
            .setDescription('Deactivates the automated welcoming system framework.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const emoji = {
        mark: '<:Mark:1509557248534253568>',
        warning: '<:Warning:1509557251181117500>',
        bell: '<:Bell:1509557209363775638>',
        member: '<:Member:1509557217961967716>'
    };

    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // WELCOME ACTIVATION CONFIGURATION MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'enable') {
        const targetChannel = interaction.options.getChannel('channel');
        
        global.welcomeConfig.enabled = true;
        global.welcomeConfig.channelId = targetChannel.id;

        const activationEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.mark} Welcome Grid Interface Activated`)
            .setDescription(`>>> The automated perimeter handshake vector has been configured and initialized successfully into the server framework core.`)
            .addFields(
                {
                    name: '__OPERATIONAL ASSIGNMENT__',
                    value: `* **System Status:** \`🟢 ONLINE\`\n* **Routing Directory:** ${targetChannel} (\`${targetChannel.id}\`)\n* **Display Profiler:** Premium Azure Embed Matrix`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** New arrivals will now receive automated greetings logging their profile telemetry and account footprint data directly into this channel layer.`,
                    inline: false
                }
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [activationEmbed] });
    }

    // ────────────────────────────────────────────────────────────────────────
    // WELCOME DEACTIVATION CONFIGURATION MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'disable') {
        global.welcomeConfig.enabled = false;
        global.welcomeConfig.channelId = null;

        const deactivationEmbed = new EmbedBuilder()
            .setColor('#FF3333') // Alert Crimson
            .setTitle(`${emoji.warning} Welcome Grid Interface Offline`)
            .setDescription(`>>> The automated greeting sequence has been systematically completely severed and offloaded from runtime memory stacks.`)
            .addFields({
                name: '__SYSTEM UPDATE LOG__',
                value: `* **System Status:** \`🔴 OFFLINE\`\n* **Cache Registry:** Clear / Deprecated References`,
                inline: false
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [deactivationEmbed] });
    }
}
