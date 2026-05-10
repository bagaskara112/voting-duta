# Web Vote - University Voting System

This is a secure web-based voting system built for university-level elections.

## Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: NextAuth.js (Google OAuth for voters, Credentials for Admin)
- **Styling**: Vanilla CSS / CSS Modules

## Features
- **Secure Voting**: Prevents double-voting using database transactions.
- **Admin Dashboard**: Manage candidates, monitor logs, and control voting periods.
- **Real-time Results**: Public dashboard for live election results.
- **Google Integration**: Easy login for students using university-provided Google accounts.

## Getting Started

### 1. Prerequisites
- Node.js (Latest LTS)
- npm or pnpm

### 2. Setup Environment Variables
Clone `.env.example` to `.env` and fill in the required credentials:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
Sync your database schema using Prisma:
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

