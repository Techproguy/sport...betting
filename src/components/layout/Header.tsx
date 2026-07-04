'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Wallet, Bell, User } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { currentUser } from '@/lib/mock/db';

const NAV = [
  { label: 'Sports', href: '/sports' },
  { label: 'Live', href: '/live', live: true },
  { label: 'Promotions', href: '/promotions' },
  { label: 'Casino', href: '#', soon: true },
  { label: 'Results', href: '/results' },
  { label: 'Help', href: '/help' },
];

export function Header({ authed = true }: { authed?: boolean }) {
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const user = currentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4">
        <button onClick={() => setMobile(true)} className="text-secondary lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href) && n.href !== '#');
            return (
              <Link
                key={n.label}
                href={n.href}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-secondary hover:text-foreground',
                  n.soon && 'pointer-events-none opacity-60'
                )}
              >
                {n.live && <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-danger" />}
                {n.label}
                {n.soon && <Badge variant="default" className="ml-1 py-0 text-[9px]">Soon</Badge>}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden h-10 w-10 items-center justify-center rounded-md text-secondary hover:bg-elevated hover:text-foreground sm:flex">
            <Search className="h-5 w-5" />
          </button>

          {authed ? (
            <>
              <Link
                href="/dashboard/wallet"
                className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm sm:flex"
              >
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-bold tabular-nums">{formatCurrency(user.balance)}</span>
                <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">+</span>
              </Link>
              <Link href="/dashboard/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-md text-secondary hover:bg-elevated hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
              </Link>
              <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-600 text-sm font-bold text-primary-foreground">
                AM
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold text-secondary hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_rgba(0,214,111,0.6)] hover:brightness-110"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-4 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobile(false)} className="text-secondary">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.label}
                    href={n.href}
                    onClick={() => setMobile(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-secondary hover:bg-elevated hover:text-foreground',
                      n.soon && 'pointer-events-none opacity-60'
                    )}
                  >
                    {n.live && <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-danger" />}
                    {n.label}
                    {n.soon && <Badge className="ml-auto py-0 text-[9px]">Soon</Badge>}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 space-y-2 border-t border-border pt-6">
                <Link href="/dashboard" onClick={() => setMobile(false)} className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-secondary hover:bg-elevated hover:text-foreground">
                  <User className="h-4 w-4" /> My Account
                </Link>
                <Link href="/dashboard/wallet" onClick={() => setMobile(false)} className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-secondary hover:bg-elevated hover:text-foreground">
                  <Wallet className="h-4 w-4" /> Wallet · {formatCurrency(user.balance)}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
