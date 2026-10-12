'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/templates/Logo';

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/dashboard' || pathname.endsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Logout
              </Link>
            )}
          </div>

          <div className="flex items-center">
            <Logo />
            <span className="ml-2 text-lg font-medium">Home</span>
          </div>

          <div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'size-9',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        {props.children}
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
