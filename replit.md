# Student Banking/Account Management System

## Project Overview
A modern student banking system with separate admin and user dashboards for managing accounts, transactions, and real-time balance updates.

## Current Features

### User Dashboard
- ✅ Profile management with avatar upload/display
- ✅ Real-time balance display with 2-second polling
- ✅ Ledger-style transaction history (S.No, Date, Deposit, Withdraw, Balance columns)
- ✅ QR code generation for account verification
- ✅ Print functionality for dashboard
- ✅ PDF export with account details and transactions
- ✅ Excel export with structured data
- ✅ Real-time update notifications (Pusher integration)
- ✅ Logout functionality with confirmation

### Admin Dashboard
- ✅ Student account management (Create, Read, Update, Delete)
- ✅ Deposit/Withdraw transactions with reason and date
- ✅ Real-time student list polling (2-second interval)
- ✅ Transaction history tracking
- ✅ Real-time update notifications (Pusher integration)
- ✅ Profile image upload and compression
- ✅ Form state management to prevent polling conflicts
- ✅ Database persistence with MongoDB

## Real-Time Features (Pusher Integration)
- Channel-based architecture for balance updates
- Automatic broadcast when deposits/withdrawals occur
- Real-time status indicators on both dashboards
- Prevents token conflicts between admin and user sessions

## Technical Stack
- **Frontend**: React, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Real-Time**: Pusher (WebSocket-based)
- **UI Components**: Radix UI, Lucide Icons
- **Export**: jsPDF, XLSX
- **QR Code**: qrcode.react

## Key Files
- `app/user/dashboard/page.tsx` - User dashboard
- `app/admin/dashboard/page.tsx` - Admin dashboard
- `app/api/students/route.ts` - Student CRUD endpoints
- `app/api/students/[id]/route.ts` - Individual student endpoints
- `app/api/pusher/auth/route.ts` - Pusher authentication
- `app/api/pusher/broadcast/route.ts` - Real-time broadcasts
- `lib/models/Student.ts` - MongoDB schema
- `lib/pusher.ts` - Pusher configuration
- `lib/hooks/usePusher.ts` - Pusher React hooks

## Environment Variables (Required)
```
MONGODB_URI=<connection_string>
NEXT_PUBLIC_PUSHER_KEY=<pusher_key>
NEXT_PUBLIC_PUSHER_CLUSTER=<cluster>
NEXT_PUBLIC_PUSHER_APP_ID=<app_id>
PUSHER_SECRET=<secret_key>
```

## Known Issues & Fixes Applied
1. ✅ Fixed QRCode import (use QRCodeSVG instead of default export)
2. ✅ Fixed admin auto-logout by disabling polling when forms are open
3. ✅ Fixed profile image uploads with compression for large images
4. ✅ Fixed authentication conflicts between admin and user sessions
5. ✅ Added no-cache headers to prevent stale balance display

## Future Improvements
- Firebase authentication (planned)
- Multiple admin support
- Transaction filters and search
- Advanced reporting features
- Mobile app version

## User Preferences
- Dark/Light theme toggle support
- Responsive design for mobile devices
- Ledger-style transaction display preferred

## Deployment Configuration
- Frontend: Next.js dev server on port 5000
- Backend: API routes on /api/*
- Database: MongoDB Atlas or local instance
- Real-Time: Pusher service
