'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  CreditCard,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { StatCard } from '@/components/ui/misc';
import { StatusPill } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaTrend } from '@/components/charts/Charts';
import { toast } from '@/store/toast';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

interface PaymentMethod {
  id: string;
  label: string;
  detail: string;
  icon: typeof CreditCard;
  accent: string;
  isDefault?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_visa', label: 'Visa', detail: '•••• 4242', icon: CreditCard, accent: '#3B82F6', isDefault: true },
  { id: 'pm_mc', label: 'Mastercard', detail: '•••• 5588', icon: CreditCard, accent: '#FFC107' },
  { id: 'pm_ach', label: 'ACH — Chase', detail: '•••• 1234', icon: Landmark, accent: '#00D66F' },
  { id: 'pm_pp', label: 'PayPal', detail: 'alex@email.com', icon: WalletIcon, accent: '#6366F1' },
];

// Deterministic 30-point balance history ending at the current balance.
function buildBalanceSeries(end: number) {
  const points: { day: string; balance: number }[] = [];
  const base = end * 0.62;
  for (let i = 29; i >= 0; i--) {
    // Deterministic oscillation — no Math.random, stable across server/client renders.
    const wobble = Math.sin(i * 0.7) * 180 + Math.cos(i * 1.3) * 90;
    const drift = ((29 - i) / 29) * (end - base * 0.98);
    const balance = Math.max(500, Math.round(base + drift + wobble));
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({ day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), balance });
  }
  points[points.length - 1].balance = Math.round(end);
  return points;
}

export default function WalletPage() {
  const user = currentUser();
  const series = React.useMemo(() => buildBalanceSeries(user.balance), [user.balance]);
  const recent = React.useMemo<Transaction[]>(
    () =>
      db()
        .transactions.filter((t) => t.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [user.id]
  );

  const total = user.balance + user.pendingBalance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="mt-1 text-sm text-secondary">Manage your balance, payment methods, and transaction history.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/deposit">
            <Button size="md">
              <ArrowDownToLine className="h-4 w-4" /> Deposit
            </Button>
          </Link>
          <Link href="/dashboard/withdraw">
            <Button size="md" variant="secondary">
              <ArrowUpFromLine className="h-4 w-4" /> Withdraw
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Balance hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-surface p-6">
            <div className="grid-radial pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary">
                  <WalletIcon className="h-4 w-4 text-primary" /> Available Balance
                </div>
                <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums text-gradient">
                  {formatCurrency(user.balance)}
                </p>
                <div className="mt-4 flex flex-wrap gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Pending</p>
                    <p className="text-sm font-semibold tabular-nums text-warning">{formatCurrency(user.pendingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Total</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Tier</p>
                    <p className="text-sm font-semibold text-primary">{user.vip}</p>
                  </div>
                </div>
              </div>
              <Badge variant="primary" className="shrink-0">
                <ShieldCheck className="h-3 w-3" /> Verified
              </Badge>
            </div>
            <div className="relative mt-6 flex gap-3">
              <Link href="/dashboard/deposit" className="flex-1">
                <Button className="w-full">
                  <ArrowDownToLine className="h-4 w-4" /> Deposit
                </Button>
              </Link>
              <Link href="/dashboard/withdraw" className="flex-1">
                <Button className="w-full" variant="secondary">
                  <ArrowUpFromLine className="h-4 w-4" /> Withdraw
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard label="Lifetime Deposits" value={formatCurrency(38250)} icon={ArrowDownToLine} accent="#00D66F" sub="Across all methods" />
          <StatCard label="Lifetime Withdrawals" value={formatCurrency(21400)} icon={ArrowUpFromLine} accent="#3B82F6" sub="Successfully paid out" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Balance history */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Balance History</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <Badge variant="success">Up 18.4%</Badge>
          </CardHeader>
          <CardContent>
            <AreaTrend data={series} x="day" y="balance" format={(v) => formatCurrency(v)} height={260} />
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Payment Methods</CardTitle>
            <button
              onClick={() => toast.info('Add payment method', 'Securely link a new card or bank account.')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            {PAYMENT_METHODS.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-3 transition-colors hover:border-border/80"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${m.accent}1f`, color: m.accent }}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.label}</p>
                  <p className="truncate text-xs text-muted tabular-nums">{m.detail}</p>
                </div>
                {m.isDefault && <Badge variant="primary">Default</Badge>}
              </motion.div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info('Add payment method', 'Securely link a new card or bank account.')}
            >
              <Plus className="h-4 w-4" /> Add payment method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions preview */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest wallet activity</CardDescription>
          </div>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:brightness-110"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map((t, i) => {
            const isDeposit = t.type === 'deposit';
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/40 p-3"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isDeposit ? 'bg-success/12 text-success' : 'bg-info/12 text-info'
                  )}
                >
                  {isDeposit ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">
                    {t.type} · {t.method}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted">
                    <Clock className="h-3 w-3" /> {formatDate(t.createdAt)} · {t.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-semibold tabular-nums', isDeposit && 'text-success')}>
                    {isDeposit ? '+' : ''}
                    {formatCurrency(t.amount)}
                  </p>
                  <StatusPill status={t.status} />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
