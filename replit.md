# JDSA Students Bank - Project Documentation

## Project Overview
A Next.js-based banking application for JDSA students with account management, transactions, AI assistant, and administrative dashboard.

## Current Status
- **Workflow**: Next.js Dev Server running on port 5000
- **Database**: MongoDB (mongodb+srv://jdsa)
- **Authentication**: Code-based identification (replacing password-based login)

## Recent Changes (2025-12-23)
1. ✅ Removed PostgreSQL database - using MongoDB only
2. ✅ Implemented code-based user identification system
   - Format: 2-letter prefix (from initials) + 4-digit code (e.g., MR-5774)
   - Code automatically generated for each user
3. ✅ Replaced login page with search page
   - Users can search by account code (e.g., MR-5774)
   - Users can search by full name
4. ✅ Updated Student model
   - Removed: `username`, `password` fields
   - Added: `code` field (unique)
5. ✅ Updated search API
   - Supports searching by code or name
   - Case-insensitive name search
6. ✅ Updated user dashboard
   - Displays student code instead of username
   - All functionality maintained

## Project Structure
```
app/
├── page.tsx                    # Home page with "Find Your Account" button
├── login/
│   └── page.tsx               # Search page (code/name-based lookup)
├── user/
│   └── dashboard/
│       └── page.tsx           # User dashboard
├── admin/
│   └── dashboard/
│       └── page.tsx           # Admin dashboard
└── api/
    ├── students/
    │   ├── route.ts           # Student CRUD
    │   ├── search/
    │   │   └── route.ts       # Search by code or name
    │   ├── [id]/
    │   │   └── route.ts       # Student by ID
    │   └── transaction/
    │       └── route.ts       # Transaction operations
    ├── admin/
    │   ├── login/
    │   │   └── route.ts       # Admin login
    │   └── init/
    │       └── route.ts       # Admin initialization
    └── gemini/
        └── route.ts           # AI assistant integration

lib/
├── mongodb.ts                 # MongoDB connection
├── generateCode.ts            # Code generation utility
├── models/
│   ├── Student.ts             # Student schema (updated)
│   └── Admin.ts               # Admin schema
└── students.ts                # Sample data

components/
└── ui/                        # Radix UI components

public/
├── students.png               # Hero image
└── islamic-mosque.jpg         # Background image

styles/
└── globals.css                # Global styles
```

## Key Features
- **Search-Based Access**: Users find their accounts using auto-generated codes
- **Account Management**: View balance, transactions, profile
- **AI Assistant**: Gemini integration for banking queries
- **Admin Dashboard**: Manage accounts and system status
- **Real-time Updates**: 2-second refresh interval for balance updates
- **Multiple Views**: Reports, transaction history, calculator, calendar
- **Responsive Design**: Mobile and desktop optimized

## Environment Variables
```
MONGODB_URI=mongodb+srv://jdsa:673591@jdsa.vdl0vr8.mongodb.net/?retryWrites=true&w=majority
```

## User Workflow
1. User clicks "Find Your Account" on home page
2. User enters either:
   - Account code (e.g., MR-5774)
   - Full name
3. System searches MongoDB for matching account
4. If found, user is authenticated and redirected to dashboard
5. User can view balance, transactions, and use various tools

## Next Steps for Users
1. Run the application with `npm run dev`
2. Test the search functionality with existing student accounts
3. Customize the application further as needed
4. Consider adding more features like:
   - Student profile editing
   - Advanced analytics
   - Push notifications
   - Export reports

## Integration Notes
- **Google Gemini**: Already configured for AI assistant
- **Vercel Analytics**: Enabled for tracking
- **Radix UI**: Component library for UI
- **Mongoose**: MongoDB ODM for data modeling

## Important Notes
- No user password/authentication needed - code-based identification only
- All timestamps use MongoDB timestamps
- Session stored in localStorage
- Admin users still require login with username/password
