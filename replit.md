# JDSA Students Bank

## Overview
Educational banking system built with Next.js 15 (App Router). Manages student accounts, deposits, withdrawals, and transactions for educational institutions.

## Tech Stack
- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Database**: MongoDB (via Mongoose)
- **APIs**: Google Gemini AI, Cloudinary (images), Pusher (real-time), Nodemailer (email)
- **Package Manager**: npm (with --legacy-peer-deps)

## Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components (Radix UI based)
- `lib/` - Utilities (MongoDB connection, Cloudinary, Pusher, email)
- `public/` - Static assets
- `styles/` - Global styles

## Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin credentials
- `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary config
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` - Email sending
- `NEXT_PUBLIC_PUSHER_APP_ID` / `NEXT_PUBLIC_PUSHER_KEY` / `PUSHER_SECRET` / `NEXT_PUBLIC_PUSHER_CLUSTER` - Pusher real-time
- `NEXT_PUBLIC_BASE_URL` - Base URL for metadata
- `ADMIN_INIT_SECRET` - Admin initialization secret

## Development
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build`
- Start: `npm run start` (port 5000)

## Recent Changes
- 2026-02-24: Migrated from Vercel to Replit
  - Removed @vercel/analytics (Vercel-specific)
  - Updated metadata URLs from vercel.app to replit.app
  - Fixed next.config.ts allowedDevOrigins placement
  - Configured deployment for Replit autoscale
