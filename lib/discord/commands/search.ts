import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalSubmitInteraction, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for a student by code or name');

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('studentSearchModal')
    .setTitle('Student Search');

  const queryInput = new TextInputBuilder()
    .setCustomId('searchQuery')
    .setLabel("Enter student code or name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. MR-5774 or John Doe')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(queryInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

export async function handleModal(interaction: ModalSubmitInteraction) {
  const query = interaction.fields.getTextInputValue('searchQuery');
  await interaction.deferReply({ ephemeral: true });

  try {
    const { default: mongoose } = await import('mongoose');
    
    if (mongoose.connection.readyState === 0) {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (MONGODB_URI) {
        await mongoose.connect(MONGODB_URI);
      }
    }

    const dbName = process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'test';
    const db = mongoose.connection.useDb(dbName);
    
    const student = await db.collection('students').findOne({
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    });

    if (!student) {
      return await interaction.editReply({ content: `No student found matching "${query}".` });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Student Profile: ${student.name}`)
      .setColor(0x2d6a4f)
      .setThumbnail(student.profileImage || null)
      .addFields(
        { name: 'Student Code', value: `\`${student.code || 'N/A'}\``, inline: true },
        { name: 'Current Balance', value: `**₹${(Number(student.balance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}**`, inline: true },
        { name: 'Academic Session', value: student.academicYear || 'N/A', inline: false }
      )
      .setFooter({ text: 'JDSA Student Bank • Secure Educational Banking' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('Error searching student:', err);
    await interaction.editReply({ content: 'Error searching for student. Please ensure the database is connected.' });
  }
}