# JDSA Students Bank

## Overview

JDSA Students Bank is an educational banking system designed for schools and institutions. It allows administrators to manage student accounts, process deposits and withdrawals, track transactions, and generate reports. Students can view their account balances and transaction history through a personalized dashboard.

The application is built with Next.js 15 using the App Router, React Server Components, MongoDB for data persistence, and a modern UI component library (shadcn/ui with Radix primitives).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and React Server Components
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **State Management**: React hooks and client-side state; no external state library
- **Charts**: Recharts for data visualization on admin dashboard
- **QR Code**: qrcode.react for generating student QR codes, qr-scanner for scanning

### Backend Architecture
- **API Routes**: Next.js API routes in `app/api/` directory
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom session-based auth stored in MongoDB (no JWT)
- **Password Hashing**: bcryptjs for secure password storage
- **File Uploads**: Cloudinary for profile image storage

### Data Models (MongoDB/Mongoose)
- **Student**: Core entity with name, code, balance, transactions array, academic year
- **Admin**: Administrator accounts with hashed passwords
- **Session**: Authentication sessions with tokens and expiration
- **Deposit/Withdrawal**: Separate collections for transaction records

### Key Design Patterns
- **Embedded Transactions**: Student transactions are embedded within the Student document for atomic updates
- **Session-based Auth**: Sessions stored in MongoDB with HTTP-only cookies
- **Academic Year Filtering**: Students and transactions can be filtered by academic year
- **Real-time Updates**: Pusher integration for live balance updates (optional)

### Route Structure
- `/` - Landing page
- `/login` - Student login via code or name search, QR scanning
- `/register` - New student registration
- `/user/dashboard` - Student dashboard with balance and transaction history
- `/admin-login` - Admin authentication
- `/admin/dashboard` - Main admin panel with student management
- `/admin/reports` - Transaction reporting and exports
- `/admin/bulk-edit` - Bulk transaction editing
- `/admin/qr-download` - QR code generation for students

## External Dependencies

### Database
- **MongoDB**: Primary database (connection via `MONGODB_URI` environment variable)
- **Mongoose**: ODM for MongoDB with schema validation

### Third-Party Services
- **Cloudinary**: Image upload and storage for student profile photos
  - Requires: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Pusher**: Real-time WebSocket updates for live balance changes
  - Requires: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- **Google Gemini AI**: AI assistant for admin dashboard help
  - Requires: `GEMINI_API_KEY`
- **Vercel Analytics**: Usage analytics (optional)

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_USERNAME` - Default admin username
- `ADMIN_PASSWORD` - Default admin password
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
- Cloudinary and Pusher credentials as listed above

### Key NPM Packages
- `next`, `react` - Core framework
- `mongoose`, `mongodb` - Database
- `bcryptjs` - Password hashing
- `cloudinary` - Image uploads
- `pusher`, `pusher-js` - Real-time updates
- `jspdf`, `jspdf-autotable`, `xlsx` - Report exports (PDF/Excel)
- `qrcode.react`, `qr-scanner` - QR code functionality
- `date-fns` - Date formatting
- `sonner` - Toast notifications