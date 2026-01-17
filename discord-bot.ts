import { initDiscord } from './lib/discord/client';
import chalk from 'chalk';

console.log(chalk.cyan.bold('Starting Discord Bot process...'));

async function run() {
  try {
    await initDiscord();
    console.log(chalk.green.bold('Discord Bot is running in background'));
  } catch (error) {
    console.error(chalk.red.bold('Failed to start Discord Bot:'), error);
    process.exit(1);
  }
}

run();
