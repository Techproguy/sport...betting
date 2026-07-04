'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Landmark,
  Wallet as WalletIcon,
  Check,
  ShieldCheck,
  ArrowLeft,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';
import { currentUser } from '@/lib/mock/db';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/admin/DataTable';
import { toast } from '@/store/toast';
import { mockApi } from '@/lib/mock/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const MIN = 20;

interface Method {
  id: string;
  label: string;
  detail: string;
  icon: typeof CreditCard;
  accent: string;
  arrival: string;
  instant: boolean;
}

const METHODS: Method[] = [
  { id: 'ach', label: 'ACH — Chase', detail: '•••• 1234', icon: Landmark, accent: '#00D66F', arrival: '1–3 business days', instant: false },
  { id: 'paypal', label: 'PayPal', detail: 'alex@email.com', icon: WalletIcon, accent: '#6366F1', arrival: 'Instant', instant: true },
  { id: 'visa', label: 'Visa', detail: '•••• 4242', icon: CreditCard, accent: '#3B82F6', arrival: '2–5 business days', instant: false },
];

function isoDaysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
}

// Deterministic pending withdrawals (no Math.random).
function pendingWithdrawals() {
  return [
    { id: 'wdl_p1', method: 'ACH — Chase', amount: 500, status: 'processing', createdAt: isoDaysAgo(1), reference: 'WDL480921' },
    { id: 'wdl_p2', method: 'PayPal', amount: 120, status: 'pending', createdAt: isoDaysAgo(0), reference: 'WDL480944' },
  ];
}

export default function WithdrawPage() {
  const user = currentUser();
  const available = user.balance;
  const pending = React.useMemo(pendingWithdrawals, []);

  const [value, setValue] = React.useState('');
  const [methodId, setMethodId] = React.useState('ach');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');

  const method = METHODS.find((m) => m.id === methodId)!;
  const amount = Number(value);
  const hasInput = value.trim() !== '' && !Number.isNaN(amount);

  const error =
    hasInput && amount < MIN
      ? `Minimum withdrawal is ${formatCurrency(MIN)}.`
      : hasInput && amount > available
        ? `Amount exceeds your available balance of ${formatCurrency(available)}.`
        : null;

  const valid = hasInput && !error;
  const fee = valid && method.instant ? Math.round(amount * 0.015 * 100) / 100 : 0;
  const net = valid ? Math.max(0, amount - fee) : 0;

  async function submit() {
    if (!valid || status === 'loading') return;
    setStatus('loading');
    await mockApi.withdraw(amount);
    setStatus('success');
    toast.success('Withdrawal requested', `${formatCurrency(net)} is on its way — ${method.arrival}.`);
    setTimeout(() => {
      setStatus('idle');
      setValue('');
    }, 2400);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/wallet"
          className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to wallet
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="mt-1 text-sm text-secondary">Cash out your winnings to any linked account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 lg:col-span-2">
          {/* Available */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-surface p-6">
            <div className="grid-radial pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">Available to withdraw</p>
              <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-gradient">{formatCurrency(available)}</p>
              <p className="mt-1 text-xs text-muted">Pending balance of {formatCurrency(user.pendingBalance)} unlocks once bets settle.</p>
            </div>
          </div>

          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="amt">How much would you like to withdraw?</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <Input
                    id="amt"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={cn('pl-7 tabular-nums', error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20')}
                  />
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-danger"
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250].map((v) => (
                  <button
                    key={v}
                    onClick={() => setValue(String(v))}
                    className="rounded-md border border-border bg-surface/60 px-3 py-1.5 text-xs font-semibold tabular-nums text-secondary transition-colors hover:border-border/80 hover:text-foreground"
                  >
                    ${v}
                  </button>
                ))}
                <button
                  onClick={() => setValue(String(available))}
                  className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:brightness-110"
                >
                  Max
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Method */}
          <Card>
            <CardHeader>
              <CardTitle>Withdraw to</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {METHODS.map((m) => {
                const active = m.id === methodId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethodId(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all active:scale-[0.99]',
                      active ? 'border-primary bg-primary/5' : 'border-border bg-surface/60 hover:border-border/80'
                    )}
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
                    <Badge variant={m.instant ? 'success' : 'default'}>
                      <Clock className="h-3 w-3" /> {m.arrival}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Pending withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pending.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/40 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/12 text-warning">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.method}</p>
                    <p className="truncate text-xs text-muted">
                      {formatDate(p.createdAt)} · {p.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(p.amount)}</p>
                    <StatusPill status={p.status} />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Withdrawal</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(valid ? amount : 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Destination</span>
                  <span className="font-medium">{method.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Est. arrival</span>
                  <span className="font-medium">{method.arrival}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Processing fee</span>
                  <span className="font-medium tabular-nums">{fee > 0 ? formatCurrency(fee) : 'Free'}</span>
                </div>
                <div className="border-t border-border pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">You receive</span>
                    <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(net)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={submit} loading={status === 'loading'} disabled={!valid || status === 'success'}>
                {status === 'success' ? (
                  <>
                    <Check className="h-4 w-4" /> Requested
                  </>
                ) : (
                  'Request Withdrawal'
                )}
              </Button>

              <div className="flex items-start gap-2 rounded-lg border border-border bg-surface/50 p-3 text-xs text-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                Withdrawals are reviewed for security. Standard payouts settle within the stated window; instant methods post immediately.
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Bank-grade encryption on every payout
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center shadow-card"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15"
              >
                <Check className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <p className="text-lg font-bold">Withdrawal requested</p>
                <p className="mt-1 text-sm text-secondary">
                  {formatCurrency(net)} to {method.label} · {method.arrival}.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
