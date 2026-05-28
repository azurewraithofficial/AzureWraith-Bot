import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import 'dotenv/config';

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.error("❌ ERROR: Missing DISCORD_TOKEN or CLIENT_ID in environment.");
    process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commands = [];

const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const command = await import(fileUrl);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
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
