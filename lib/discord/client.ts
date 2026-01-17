import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_BOT_TOKEN) {
  console.warn('DISCORD_BOT_TOKEN is not defined');
}

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let isInitialized = false;

export async function initDiscord() {
  if (isInitialized || !DISCORD_BOT_TOKEN) return discordClient;
  
  try {
    console.log('Attempting Discord login...');
    await discordClient.login(DISCORD_BOT_TOKEN);
    isInitialized = true;
    
    console.log(`Discord bot logged in as ${discordClient.user?.tag}`);
    discordClient.user?.setActivity('Bank Transactions', { type: ActivityType.Watching });
    discordClient.user?.setStatus('online');

    return discordClient;
  } catch (error) {
    console.error('Discord login error:', error);
    return discordClient;
  }
}

// Self-initialize if we're in a server-side context
if (typeof window === 'undefined' && DISCORD_BOT_TOKEN) {
  initDiscord().catch(err => console.error('Early Discord init failed:', err));
}
