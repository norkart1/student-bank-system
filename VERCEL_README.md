# JDSA Students Bank

This project is configured for both Replit and Vercel hosting.

## Vercel Deployment Notes
- Native modules like `discord.js` and `zlib-sync` are marked as `serverExternalPackages` in `next.config.ts`.
- The Discord bot is initialized in `lib/discord/client.ts` which runs on the server side.
- Ensure all environment variables are set in your Vercel project dashboard.
