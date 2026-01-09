# JDSA Students Bank

## Overview
A student banking application built with Next.js 16 using the App Router. This system allows students to manage their bank accounts with features for deposits, withdrawals, and transaction tracking.

## Technology Stack
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **Real-time**: Pusher
- **Image Storage**: Cloudinary
- **Analytics**: Vercel Analytics

## Project Structure
- `app/` - Next.js App Router pages and API routes
  - `api/` - Backend API endpoints
    - `students/` - Student CRUD and transactions
    - `admin/` - Admin management endpoints
    - `auth/` - Authentication endpoints
    - `gemini/` - AI integration
    - `pusher/` - Real-time events
  - `admin/` - Admin dashboard pages
  - `user/` - User dashboard pages
  - `login/` - Login page
  - `register/` - Registration page
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `public/` - Static assets
- `styles/` - Global styles

## Development
Run the development server:
```bash
npm run dev -- -H 0.0.0.0 -p 5000
```

## Environment Variables
The following secrets are configured:
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Session encryption key
- `NEXT_PUBLIC_PUSHER_*` - Pusher configuration
- `PUSHER_SECRET` - Pusher secret key
- `CLOUDINARY_*` - Cloudinary configuration
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin credentials

## Deployment
Configured for Autoscale deployment with:
- Build: `npm run build`
- Start: `npm run start -- -H 0.0.0.0 -p 5000`
