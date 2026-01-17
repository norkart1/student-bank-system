import { Client, GatewayIntentBits } from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_BOT_TOKEN) {
  console.warn('DISCORD_BOT_TOKEN is not defined');
}

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let isInitialized = false;

export async function initDiscord() {
  if (isInitialized || !DISCORD_BOT_TOKEN) return;
  
  try {
    await discordClient.login(DISCORD_BOT_TOKEN);
    isInitialized = true;
    console.log('Discord bot logged in');
  } catch (error) {
    console.error('Discord login error:', error);
  }
}
