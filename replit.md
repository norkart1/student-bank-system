# JDSA Students Bank

## Overview

JDSA Students Bank is an educational banking simulation platform designed specifically for educational institutions. It provides a comprehensive system for managing student accounts, deposits, withdrawals, and transaction tracking. The platform supports multiple user roles (students, teachers, admins) and includes features like QR code-based student lookup, real-time updates via Pusher, and AI-powered assistance through Google Gemini.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14+ with App Router and React Server Components
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **State Management**: React hooks with local state; no external state library
- **Font**: Poppins from Google Fonts

### Backend Architecture
- **API Routes**: Next.js API routes in `app/api/` directory
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom session-based auth stored in MongoDB with HTTP-only cookies
- **Real-time Updates**: Pusher for live balance and transaction notifications

### Data Models (MongoDB/Mongoose)
- **Student**: Core entity with name, code, academic year, balance, and embedded transactions array
- **Admin**: Administrator accounts with password hashing via bcryptjs
- **Session**: Authentication sessions with token-based verification and auto-expiry
- **AcademicSession**: Tracks academic years for filtering students
- **Deposit/Withdrawal**: Separate collections for transaction logging

### Authentication Flow
1. Students log in via code or name search (no password required - educational simulation)
2. Admins log in with username/password (OTP via email available but optional)
3. Teachers have separate login with credentials
4. Sessions stored in MongoDB with 7-day expiration
5. Cookie-based token verification on protected routes

### Key Features
- Student account management with balance tracking
- Deposit and withdrawal transactions with date and reason
- QR code generation for quick student lookup
- Bulk transaction upload via Excel files
- PDF and Excel report generation
- AI chatbot integration (Google Gemini) for admin assistance
- Real-time updates across clients via Pusher
- Multi-academic year support

## External Dependencies

### Database
- **MongoDB**: Primary database (connection via `MONGODB_URI` environment variable)
- **Mongoose**: ODM for MongoDB schema management

### Third-Party Services
- **Cloudinary**: Image hosting for student profile photos
- **Pusher**: Real-time websocket communication for live updates
- **Google Gemini AI**: AI assistant for admin dashboard
- **Nodemailer/Gmail**: Email service for OTP delivery

### Key NPM Packages
- `bcryptjs`: Password hashing for admin accounts
- `qrcode.react` / `qr-scanner`: QR code generation and scanning
- `jspdf` / `jspdf-autotable`: PDF report generation
- `xlsx`: Excel file parsing and generation
- `date-fns` / `react-day-picker`: Date handling and calendar components
- `recharts`: Charts for dashboard analytics
- `axios`: HTTP client for API requests

### Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: Default admin credentials
- `CLOUDINARY_*`: Cloudinary API credentials
- `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*`: Pusher credentials
- `GEMINI_API_KEY`: Google Gemini API key
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`: Email service credentials