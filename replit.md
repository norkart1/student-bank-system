# JDSA Students Bank

## Overview
A student banking application built with Next.js 15, React 19, and MongoDB (Mongoose). Features include user authentication, admin/teacher dashboards, and cloud image storage via Cloudinary.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Real-time**: Pusher

## Project Structure
```
app/
├── api/          # API routes
├── admin/        # Admin dashboard
├── teacher/      # Teacher dashboard
├── user/         # User pages
├── login/        # Login pages
├── register/     # Registration
└── components/   # Shared app components
components/       # UI components (shadcn/ui)
lib/              # Utilities and database
public/           # Static assets
styles/           # Global styles
```

## Running the Application
- Development: `npm run dev -- -H 0.0.0.0 -p 5000`
- Build: `npm run build`
- Production: `npm start`

## Environment Variables Required
The app requires MongoDB connection string and other secrets to be configured for full functionality.

## Recent Changes
- Initial Replit import (Feb 2026)
- Configured Next.js for Replit proxy support
