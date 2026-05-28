import { REST, Routes, PermissionFlagsBits } from 'discord.js';
import 'dotenv/config';

// Ensure environment variables exist
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.error("❌ ERROR: Missing DISCORD_TOKEN or CLIENT_ID in environment.");
    process.exit(1);
}

// Temporary hardcoded command for testing the deployer
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    }
];

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy the commands to Discord
(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Routes.applicationCommands registers GLOBAL commands (available in all servers)
        // Note: Global commands can take up to 10 minutes to cache/appear everywhere the first time
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        process.exit(1);
    }
})();
