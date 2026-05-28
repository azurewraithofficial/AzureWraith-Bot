import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Initialize the Discord Client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Event listener for when the bot comes online
client.once('ready', () => {
    console.log(`🤖 Azure Wraith Community Bot is online as ${client.user.tag}!`);
});

// Log the bot in using the environment variable
client.login(process.env.DISCORD_TOKEN);
