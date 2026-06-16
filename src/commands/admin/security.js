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
    // Custom High-Fidelity Emoji Vector Asset Matrix
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
    // PHASE 1: TELEMETRY DASHBOARD CONSOLE VIEW
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'dashboard') {
        const raidStatusLine = global.securityConfig.antiRaid 
            ? '`🟢 SYSTEM_ONLINE` ── Perimeter Firewall Intercept Enabled' 
            : '`🔴 SYSTEM_OFFLINE` ── Security Firewall Suspended';

        const nukeStatusLine = global.securityConfig.antiNuke 
            ? '`🟢 SYSTEM_ONLINE` ── Administrative Clearances Monitored' 
            : '`🔴 SYSTEM_OFFLINE` ── Privilege Overrides Interception Inactive';

        const dashboardEmbed = new EmbedBuilder()
            .setColor(global.securityConfig.antiRaid && global.securityConfig.antiNuke ? '#007FFF' : '#FFCC00') // Azure or Caution Amber
            .setTitle(`🛡️ MAINFRAME OPERATIONAL CONTROL // DEFENSE TELEMETRY`)
            .setDescription('>>> Real-time tracking analytics for server perimeter automated defense arrays, network gatekeeper values, and asynchronous internal auditing structures.')
            .addFields(
                {
                    name: `📡 ── PERIMETER ANTI-RAID INFRASTRUCTURE`,
                    value: 
                        `* **System State:** ${raidStatusLine}\n` +
                        `* **Velocity Cap:** \`${global.securityConfig.joinThreshold} handshakes / 10s\`\n` +
                        `* **Mitigation Protocol:** \`AUTOMATED INTERCEPT / SERVER LOCKDOWN\``,
                    inline: false
                },
                {
                    name: `☣️ ── BACKBONE ANTI-NUKE MONITOR`,
                    value: 
                        `* **System State:** ${nukeStatusLine}\n` +
                        `* **Malice Metric:** \`${global.securityConfig.deleteThreshold} channel deletions / 60s\`\n` +
                        `* **Mitigation Protocol:** \`STRIP ELEVATED CLEARANCES & AUTO-CLONE ASSETS\``,
                    inline: false
                },
                {
                    name: ' ',
                    value: '───\n' + `${emoji.bell} **System Cluster Node:** Synchronization active. Direct runtime mutations propagate across memory space and update background clusters instantaneously.`,
                    inline: false
                }
            )
            .setFooter({ text: 'Mainframe Infrastructure Secure • Kernel v4.16' })
            .setTimestamp();

        return interaction.editReply({ embeds: [dashboardEmbed] });
    }

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 2: MUTATION ROUTINE // TOGGLE INFRASTRUCTURE STATE
    // ────────────────────────────────────────────────────────────────────────
    if (subcommand === 'toggle') {
        const selectedSystem = interaction.options.getString('system');
        
        // Execute Atomic Configuration Swap
        global.securityConfig[selectedSystem] = !global.securityConfig[selectedSystem];

        const systemLabel = selectedSystem === 'antiRaid' ? 'Perimeter Anti-Raid Gateway' : 'Backbone Anti-Nuke Interceptor';
        const systemState = global.securityConfig[selectedSystem];
        
        // Dynamic Matrix Color Assignment based on modern secure state
        const stateColor = systemState ? '#00FF7F' : '#FF3333'; 

        const successEmbed = new EmbedBuilder()
            .setColor(stateColor)
            .setTitle(`${emoji.mark} HARDWARE ROUTER CONFIGURATION RE-INDEXED`)
            .setDescription(`>>> The server's administrative hardware firewall parameters have successfully processed a state mutation directive.`)
            .addFields({
                name: `📋 ── CORE MODIFICATION LOG`,
                value: 
                    `* **Target Infrastructure:** \`${systemLabel}\`\n` +
                    `* **Updated Vector State:** ${systemState ? '`🟢 ARMED / ACTIVE`' : '`🔴 SUSPENDED / BYPASSED`'}\n` +
                    `* **Operator Sign-off:** ${interaction.user}`,
                inline: false
            })
            .setFooter({ text: 'Mainframe Cluster Matrix Refreshed' })
            .setTimestamp();

        return interaction.editReply({ embeds: [successEmbed] });
    }
}
