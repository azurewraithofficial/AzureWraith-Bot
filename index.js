import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import 'dotenv/config';

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ ERROR: DISCORD_TOKEN is not defined.");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Attach a Collection to the client to store loaded commands
client.commands = new Collection();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Dynamically load all commands for runtime execution
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const command = await import(fileUrl);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Azure Wraith Community Bot is online as ${readyClient.user.tag}!`);
});

// Universal Interaction Handler
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Retrieve the command using its registered name
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // Execute the handler native to that specific command file
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
