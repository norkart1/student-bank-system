# JDSA Students Bank

## Overview

JDSA Students Bank is an educational banking system designed specifically for educational institutions. It provides a comprehensive platform to manage student accounts, handle deposits and withdrawals, track transaction history, and generate reports. The application supports both student-facing dashboards and administrative interfaces with real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: React hooks and local state
- **Real-time Updates**: Pusher for WebSocket-based live updates

### Backend Architecture

- **API Routes**: Next.js API routes (App Router) located in `/app/api/`
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom session-based auth using MongoDB-stored sessions with HTTP-only cookies
- **Password Hashing**: bcryptjs for secure password storage

### Key Design Patterns

1. **Session Management**: Sessions are stored in MongoDB with automatic expiration (7 days). The `Session` model handles both admin and user authentication.

2. **Student Data Model**: Students have embedded transactions within their document, allowing atomic updates to balance and transaction history simultaneously.

3. **Academic Year Support**: Students are organized by academic year, enabling historical data preservation and year-over-year comparisons.

4. **Separate Transaction Records**: While transactions are embedded in students, separate `Deposit` and `Withdrawal` collections exist for reporting purposes.

### API Structure

- `/api/students` - CRUD operations for students
- `/api/students/[id]` - Individual student operations
- `/api/students/[id]/transaction/*` - Transaction management (add, update, delete)
- `/api/admin/*` - Admin authentication and management
- `/api/auth/*` - User authentication (login, logout, verify)
- `/api/pusher/*` - Real-time notification handling

### Security Measures

- HTTP security headers configured in `next.config.ts`
- Password hashing with bcryptjs
- Session-based authentication with secure cookies
- Protected admin routes

## External Dependencies

### Database
- **MongoDB**: Primary data store for students, transactions, sessions, and admin accounts
- **Mongoose**: ODM for MongoDB schema definition and data validation

### Cloud Services
- **Cloudinary**: Image upload and storage for student profile pictures
- **Vercel Analytics**: Application analytics and monitoring
- **Pusher**: Real-time WebSocket communication for live updates

### AI Integration
- **Google Gemini AI**: AI assistant for admin dashboard queries (`@google/genai`)

### Document Generation
- **jsPDF**: PDF generation for reports and QR codes
- **jspdf-autotable**: Table formatting in PDF exports
- **xlsx**: Excel file import/export for bulk operations
- **html2canvas**: Screenshot generation for printable content

### Other Key Libraries
- **qrcode.react**: QR code generation for student identification
- **qr-scanner**: Camera-based QR code scanning
- **react-day-picker**: Date selection components
- **date-fns**: Date formatting and manipulation
- **next-themes**: Theme management (dark/light mode)
- **sonner**: Toast notifications