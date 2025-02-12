import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SessionBurst',
  description: 'Simulate realistic user interactions',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div suppressHydrationWarning>
          {session && <Navbar />}
          {children}
        </div>
      </body>
    </html>
  );
}
