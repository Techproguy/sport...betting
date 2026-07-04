'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wallet, Ticket, History, Gift, Bell, User, Settings,
  Shield, HeartPulse, ArrowDownToLine, ArrowUpFromLine, Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GROUPS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Bets', href: '/dashboard/bets', icon: Ticket },
      { label: 'Bet History', href: '/dashboard/bet-history', icon: History },
    ],
  },
  {
    title: 'Wallet',
    items: [
      { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
      { label: 'Deposit', href: '/dashboard/deposit', icon: ArrowDownToLine },
      { label: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowUpFromLine },
      { label: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    ],
  },
  {
    title: 'Rewards',
    items: [
      { label: 'Bonuses', href: '/dashboard/bonuses', icon: Gift },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/dashboard/profile', icon: User },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      { label: 'Security', href: '/dashboard/security', icon: Shield },
      { label: 'Responsible Gambling', href: '/dashboard/responsible-gambling', icon: HeartPulse },
    ],
  },
];

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.title}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-primary/12 text-primary' : 'text-secondary hover:bg-elevated hover:text-foreground'
                  )}
                >
                  <it.icon className="h-[18px] w-[18px]" />
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
