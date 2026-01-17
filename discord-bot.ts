import { initDiscord } from './lib/discord/client';

console.log('Starting Discord Bot process...');

async function run() {
  try {
    await initDiscord();
    console.log('Discord Bot is running in background');
  } catch (error) {
    console.error('Failed to start Discord Bot:', error);
    process.exit(1);
  }
}

run();
