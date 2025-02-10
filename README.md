# SessionBurst

SessionBurst is a freemium web application designed for SaaS analytics professionals to simulate realistic user interactions and session data for demonstration and testing purposes.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** Supabase with Google & GitHub OAuth
- **Styling:** Tailwind CSS with Geist Font
- **Database:** Supabase
- **Analytics:** PostHog
- **Payments:** Stripe

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with the following variables:
   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- OAuth authentication with Google and GitHub
- Session simulation with natural language inputs
- Detailed analytics logging
- Freemium to subscription model
- Cross-browser testing capabilities

## Project Structure

- `src/`
  - `app/` - Next.js 14 app directory
    - `auth/` - Authentication routes
      - `login/` - Login page
      - `callback/` - OAuth callback handler
    - `dashboard/` - Dashboard pages
    - `layout.tsx` - Root layout
    - `page.tsx` - Home page
  - `components/` - Reusable components
    - `Navbar.tsx` - Navigation bar
  - `lib/` - Utility functions
    - `supabase.ts` - Supabase client

## Legal Notice

© 2024 SessionBurst. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.    