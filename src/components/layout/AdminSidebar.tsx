'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileCheck, CalendarDays, Trophy, Sliders, Ticket, Scale,
  ShieldAlert, Search, ArrowDownToLine, ArrowUpFromLine, CreditCard, FileBarChart,
  BarChart3, Gift, FileText, Settings, ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

const GROUPS = [
  {
    title: 'Operations',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'KYC', href: '/admin/kyc', icon: FileCheck },
      { label: 'Events', href: '/admin/events', icon: CalendarDays },
      { label: 'Sports & Odds', href: '/admin/odds', icon: Sliders },
    ],
  },
  {
    title: 'Trading',
    items: [
      { label: 'Bets', href: '/admin/bets', icon: Ticket },
      { label: 'Settlement', href: '/admin/settlement', icon: Scale },
      { label: 'Risk', href: '/admin/risk', icon: Trophy },
      { label: 'Fraud', href: '/admin/fraud', icon: ShieldAlert },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Deposits', href: '/admin/deposits', icon: ArrowDownToLine },
      { label: 'Withdrawals', href: '/admin/withdrawals', icon: ArrowUpFromLine },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Reports', href: '/admin/reports', icon: FileBarChart },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Promotions', href: '/admin/promotions', icon: Gift },
      { label: 'CMS', href: '/admin/cms', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Audit Logs', href: '/admin/audit', icon: ScrollText },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Logo href="/admin" />
        <span className="ml-1 rounded bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          Admin
        </span>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">{g.title}</p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = pathname === it.href;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-primary/12 text-primary' : 'text-secondary hover:bg-elevated hover:text-foreground'
                    )}
                  >
                    <it.icon className="h-[17px] w-[17px]" />
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
