# JDSA Students Bank - Vercel Hosting Guide

To host this project on Vercel, follow these exact steps:

1. **Framework Preset**: Select **Next.js**.
2. **Build Command**: Set to `npm run build` (which is `next build`).
3. **Environment Variables**: Add these in the Vercel Dashboard:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `DISCORD_BOT_TOKEN`: Your Discord bot token.
   - `DISCORD_CLIENT_ID`: Your Discord application ID.
   - `DISCORD_GUILD_ID`: Your Discord server ID.
   - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`: For real-time updates.

4. **Why Turbopack fails**: Vercel's default "Turbopack" builder does not support C++ native modules like `zlib-sync`.
5. **The Fix**: I have configured `next.config.ts` with `serverExternalPackages`. This tells Vercel to use the stable Webpack builder automatically.

**Note**: Do NOT use the `--turbo` flag in your Vercel project settings.
