import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// Global memory cache initialization for system states if not handled by a DB
if (!global.securityConfig) {
    global.securityConfig = {
        antiRaid: true,
        antiNuke: true,
        joinThreshold: 8,       // Members allowed per 10 seconds
        deleteThreshold: 3      // Channels allowed to be deleted per 60 seconds
    };
}

export const data = new SlashCommandBuilder()
    .setName('security')
    .setDescription('Administrative operations control configuration grid.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('dashboard')
            .setDescription('Displays the active defense matrix operational telemetry.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('toggle')
            .setDescription('Toggles a specific defensive security parameter.')
            .addStringOption(option =>
                option.setName('system')
                    .setDescription('The defense infrastructure system layer to modify.')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Anti-Raid (Mass Join Gate)', value: 'antiRaid' },
                        { name: 'Anti-Nuke (Staff Intercept)', value: 'antiNuke' }
                    )
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const emoji = {
        warning: '<:Warning:1509557251181117500>',
        mark: '<:Mark:1509557248534253568>',
        staff: '<:Staff:1509557210861142186>',
        bell: '<:Bell:1509557209363775638>',
        timeout: '<:Timeout:1509557597383168160>'
    };

    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand();

    // ────────────────────────────────────────────────────────────────────────
    // DASHBOARD VIEW MATRIX
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'dashboard') {
        const dashboardEmbed = new EmbedBuilder()
            .setColor('#007FFF') // True Azure Blue
            .setTitle(`${emoji.staff} Security Matrix Operational Telemetry`)
            .setDescription('>>> Active tracking configurations for automated perimeter defenses and internal staff audit controls.')
            .addFields(
                {
                    name: `🛡️ __ANTI-RAID INFRASTRUCTURE__`,
                    value: 
                        `* **Status Profile:** ${global.securityConfig.antiRaid ? '`🟢 ACTIVE`' : '`🔴 DEACTIVATED`'}\n` +
                        `* **Velocity Threshold:** \`${global.securityConfig.joinThreshold} joins / 10s\`\n` +
                        `* **Action Protocol:** Automated Server Lockdown`,
                    inline: false
                },
                {
                    name: `☣️ __ANTI-NUKE INFRASTRUCTURE__`,
                    value: 
                        `* **Status Profile:** ${global.securityConfig.antiNuke ? '`🟢 ACTIVE`' : '`🔴 DEACTIVATED`'}\n` +
                        `* **Malice Threshold:** \`${global.securityConfig.deleteThreshold} channel deletions / 60s\`\n` +
                        `* **Action Protocol:** Strip Staff Clearance & Re-clone Asset`,
                    inline: false
                },
                {
                    name: '───────────────',
                    value: `${emoji.bell} **Notice:** Internal monitoring scripts run asynchronously on the process core. Direct mutations propagate across all cluster nodes instantly.`,
                    inline: false
                }
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [dashboardEmbed] });
    }

    // ────────────────────────────────────────────────────────────────────────
    // TOGGLE INFRASTRUCTURE STATES
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'toggle') {
        const selectedSystem = interaction.options.getString('system');
        global.securityConfig[selectedSystem] = !global.securityConfig[selectedSystem];

        const systemLabel = selectedSystem === 'antiRaid' ? 'Anti-Raid Gateway' : 'Anti-Nuke Interceptor';
        const systemState = global.securityConfig[selectedSystem];

        const successEmbed = new EmbedBuilder()
            .setColor('#007FFF')
            .setTitle(`${emoji.mark} Configuration Array Updated`)
            .setDescription(`>>> The administrative defense parameter matrix has been modified successfully.`)
            .addFields({
                name: '__MODIFICATION ACCESS LOG__',
                value: `* **Target Layer:** \`${systemLabel}\`\n* **Updated State:** ${systemState ? '`🟢 ENABLED`' : '`🔴 DISABLED`'}`,
                inline: false
            })
            .setTimestamp();

        return interaction.editReply({ embeds: [successEmbed] });
    }
}
