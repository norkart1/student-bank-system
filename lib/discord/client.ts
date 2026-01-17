import { Client, GatewayIntentBits, ActivityType, Events, REST, Routes, SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalSubmitInteraction } from 'discord.js';
import * as searchCommand from './commands/search';
import * as totalBalanceCommand from './commands/total-balance';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.warn('Discord credentials missing in environment variables');
}

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let isInitialized = false;

// Command Definitions
const commands = [
  searchCommand.data.toJSON(),
  totalBalanceCommand.data.toJSON(),
];

async function registerCommands() {
  if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID) return;
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  try {
    console.log('Clearing old commands and refreshing new commands.');
    
    // Clear all existing global commands
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [] },
    );
    
    // Clear and re-register guild commands
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] },
    );
    
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    
    // Also update global commands
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

export async function initDiscord() {
  if (isInitialized || !DISCORD_BOT_TOKEN) return discordClient;
  
  try {
    console.log('Attempting Discord login...');
    
    discordClient.on(Events.ClientReady, async (c) => {
      console.log(`Discord bot logged in as ${c.user.tag}`);
      c.user.setActivity('JDSA Student Bank', { type: ActivityType.Watching });
      c.user.setStatus('online');
      await registerCommands();
    });

    discordClient.on(Events.Error, (error) => {
      console.error('Discord client error:', error);
    });

    discordClient.on(Events.ShardDisconnect, (event) => {
      console.warn('Discord shard disconnected:', event);
    });

    discordClient.on(Events.ShardReconnecting, (id) => {
      console.log(`Discord shard ${id} reconnecting...`);
    });

    // Handle Interaction
    discordClient.on(Events.InteractionCreate, async interaction => {
      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'total-balance') {
          await totalBalanceCommand.execute(interaction);
        }

        if (commandName === 'search') {
          await searchCommand.execute(interaction);
        }
      } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'studentSearchModal') {
          await searchCommand.handleModal(interaction);
        }
      }
    });

    await discordClient.login(DISCORD_BOT_TOKEN);
    isInitialized = true;
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
