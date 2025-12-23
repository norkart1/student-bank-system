# JDSA Students Bank

## Overview

JDSA Students Bank is a web-based banking management system designed for educational institutions. It provides a dual-interface platform where administrators can manage student accounts and transactions, while students can view their balances, transaction history, and access various banking features. The application includes AI-powered assistance using Google's Gemini API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14+ with App Router and React Server Components (RSC enabled)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Font**: Poppins (Google Fonts) with variable weights

### Application Structure
- **App Router Pattern**: Uses Next.js app directory with file-based routing
- **Role-Based Access**: Two distinct user roles (admin and student) with separate dashboard experiences
- **Authentication**: Client-side authentication using localStorage for session management
- **State Management**: React useState/useEffect hooks for local component state

### Key Routes
- `/` - Landing page with onboarding
- `/login` - Unified login for admins and students
- `/register` - Account registration for new users
- `/admin/dashboard` - Admin panel for managing students and transactions
- `/user/dashboard` - Student dashboard for viewing account details

### Data Architecture
- **Current Storage**: localStorage for client-side data persistence (students, accounts, transactions)
- **Data Models**: Students have profiles with balance, transaction history, and credentials
- **No Database Currently**: Application uses in-memory defaults and localStorage; ready for database integration

### API Routes
- `/api/gemini` - AI assistant integration using Google Gemini 2.5 Flash model
- `/api/system/status` - System health monitoring (RAM, CPU, MongoDB stats)

### Third-Party UI Libraries
- Recharts for data visualization (bar charts)
- html2canvas and jsPDF for PDF generation
- xlsx for Excel export functionality
- embla-carousel-react for carousel components
- cmdk for command palette functionality

## External Dependencies

### AI Integration
- **Google Gemini API** (`@google/genai`): Powers the AI assistant feature for admin support
- Requires `GEMINI_API_KEY` environment variable

### Database (Optional/Future)
- **MongoDB**: Referenced in system status API for storage monitoring
- Requires `MONGODB_URI` environment variable when enabled

### Analytics
- **Vercel Analytics** (`@vercel/analytics`): Production analytics tracking

### Document Generation
- **jsPDF**: PDF report generation
- **xlsx**: Excel spreadsheet export
- **html2canvas**: Screen capture for exports

### Theme Management
- **next-themes**: Dark/light mode switching with system preference support