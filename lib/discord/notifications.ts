import { discordClient, initDiscord } from './client';
import { TextChannel, EmbedBuilder } from 'discord.js';

const GUILD_ID = process.env.DISCORD_GUILD_ID;

export async function sendTransactionNotification(studentName: string, amount: number, type: 'deposit' | 'withdraw', balance: number) {
  try {
    const client = await initDiscord();
    if (!client.isReady()) {
      console.warn('Discord client not ready, skipping notification');
      return;
    }
    
    const guild = await client.guilds.fetch(GUILD_ID!);
    const channels = await guild.channels.fetch();
    
    // Find or create a 'transactions' channel
    let channel = channels.find(c => c?.name === 'transactions' && c.isTextBased()) as TextChannel;
    
    if (!channel) {
      channel = await guild.channels.create({
        name: 'transactions',
        reason: 'Automated student bank notifications',
      }) as TextChannel;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Transaction Alert: ${type.toUpperCase()}`)
      .setColor(type === 'deposit' ? 0x2d6a4f : 0xdc3545)
      .addFields(
        { name: 'Student', value: studentName, inline: true },
        { name: 'Amount', value: `₹${Math.abs(amount).toFixed(2)}`, inline: true },
        { name: 'New Balance', value: `₹${balance.toFixed(2)}`, inline: true }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send discord notification:', error);
  }
}
