import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('total-balance')
  .setDescription('Check the total balance of all students');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const { default: mongoose } = await import('mongoose');
    
    // Ensure we are connected
    if (mongoose.connection.readyState === 0) {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (MONGODB_URI) {
        await mongoose.connect(MONGODB_URI);
      }
    }

    const dbName = process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'test';
    const db = mongoose.connection.useDb(dbName);
    const students = await db.collection('students').find({}).toArray();
    const total = students.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);
    
    const embed = new EmbedBuilder()
      .setTitle('Bank Status: Total Balance')
      .setColor(0x2d6a4f)
      .setDescription(`The current total balance across all **${students.length}** students is:`)
      .addFields({ name: 'Total Amount', value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error('Error fetching total balance:', err);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Error fetching total balance. Please ensure the database is connected.', ephemeral: true });
    }
  }
}