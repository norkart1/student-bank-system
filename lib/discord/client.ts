import { Client, GatewayIntentBits, ActivityType, Events, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

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
  new SlashCommandBuilder()
    .setName('total-balance')
    .setDescription('Check the total balance of all students'),
  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a student by code or name')
    .addStringOption(option => 
      option.setName('query')
        .setDescription('Student code or name')
        .setRequired(true)),
].map(command => command.toJSON());

async function registerCommands() {
  if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID) return;
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
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
    
    discordClient.once(Events.ClientReady, async (c) => {
      console.log(`Discord bot logged in as ${c.user.tag}`);
      c.user.setActivity('JDSA Student Bank', { type: ActivityType.Watching });
      c.user.setStatus('online');
      await registerCommands();
    });

    // Handle Commands
    discordClient.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'total-balance') {
        try {
          // Dynamic import to avoid circular dependency
          const { default: mongoose } = await import('mongoose');
          const dbName = process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'test';
          const db = mongoose.connection.useDb(dbName);
          const students = await db.collection('students').find({}).toArray();
          const total = students.reduce((sum, s) => sum + (s.balance || 0), 0);
          
          const embed = new EmbedBuilder()
            .setTitle('Bank Status: Total Balance')
            .setColor(0x2d6a4f)
            .setDescription(`The current total balance across all **${students.length}** students is:`)
            .addFields({ name: 'Total Amount', value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        } catch (err) {
          console.error(err);
          await interaction.reply({ content: 'Error fetching total balance.', ephemeral: true });
        }
      }

      if (commandName === 'search') {
        const query = interaction.options.getString('query');
        try {
          const { default: mongoose } = await import('mongoose');
          const dbName = process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'test';
          const db = mongoose.connection.useDb(dbName);
          
          const student = await db.collection('students').findOne({
            $or: [
              { code: { $regex: query, $options: 'i' } },
              { name: { $regex: query, $options: 'i' } }
            ]
          });

          if (!student) {
            return await interaction.reply({ content: `No student found matching "${query}".`, ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setTitle(`Student Profile: ${student.name}`)
            .setColor(0x2d6a4f)
            .addFields(
              { name: 'Code', value: student.code || 'N/A', inline: true },
              { name: 'Balance', value: `₹${(student.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, inline: true },
              { name: 'Academic Year', value: student.academicYear || 'N/A', inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        } catch (err) {
          console.error(err);
          await interaction.reply({ content: 'Error searching for student.', ephemeral: true });
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
