'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Landmark,
  Wallet as WalletIcon,
  Apple,
  Check,
  ShieldCheck,
  Zap,
  Gift,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/store/toast';
import { mockApi } from '@/lib/mock/api';
import { formatCurrency, cn } from '@/lib/utils';

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

interface Method {
  id: string;
  label: string;
  detail: string;
  icon: typeof CreditCard;
  accent: string;
  isCard: boolean;
}

const METHODS: Method[] = [
  { id: 'visa', label: 'Visa', detail: '•••• 4242', icon: CreditCard, accent: '#3B82F6', isCard: true },
  { id: 'mc', label: 'Mastercard', detail: '•••• 5588', icon: CreditCard, accent: '#FFC107', isCard: true },
  { id: 'ach', label: 'ACH — Chase', detail: '•••• 1234', icon: Landmark, accent: '#00D66F', isCard: false },
  { id: 'paypal', label: 'PayPal', detail: 'alex@email.com', icon: WalletIcon, accent: '#6366F1', isCard: false },
  { id: 'apple', label: 'Apple Pay', detail: 'Touch to pay', icon: Apple, accent: '#A0A0A0', isCard: false },
];

function bonusFor(amount: number) {
  if (amount >= 500) return Math.round(amount * 0.2);
  if (amount >= 250) return Math.round(amount * 0.15);
  if (amount >= 100) return Math.round(amount * 0.1);
  return 0;
}

export default function DepositPage() {
  const [amount, setAmount] = React.useState<number>(100);
  const [custom, setCustom] = React.useState('');
  const [methodId, setMethodId] = React.useState('visa');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');

  const method = METHODS.find((m) => m.id === methodId)!;
  const bonus = bonusFor(amount);
  const valid = amount >= 10;

  function selectChip(v: number) {
    setAmount(v);
    setCustom('');
  }

  function onCustom(v: string) {
    setCustom(v);
    const n = Number(v);
    if (!Number.isNaN(n) && n > 0) setAmount(n);
  }

  async function submit() {
    if (!valid || status === 'loading') return;
    setStatus('loading');
    await mockApi.deposit(amount);
    setStatus('success');
    toast.success('Deposit successful', `${formatCurrency(amount)} added to your balance.`);
    setTimeout(() => {
      setStatus('idle');
      setAmount(100);
      setCustom('');
    }, 2200);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard/wallet"
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to wallet
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Deposit Funds</h1>
          <p className="mt-1 text-sm text-secondary">Add money to your balance instantly and start playing.</p>
        </div>
        <Badge variant="success" className="shrink-0">
          <Zap className="h-3 w-3" /> Instant deposit
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => selectChip(v)}
                    className={cn(
                      'rounded-lg border px-3 py-3 text-sm font-semibold tabular-nums transition-all active:scale-[0.98]',
                      amount === v && !custom
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface/60 text-secondary hover:border-border/80 hover:text-foreground'
                    )}
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <div>
                <Label htmlFor="custom">Custom amount</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <Input
                    id="custom"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    value={custom}
                    onChange={(e) => onCustom(e.target.value)}
                    className="pl-7 tabular-nums"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method picker */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => {
                const active = m.id === methodId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethodId(m.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 text-left transition-all active:scale-[0.99]',
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
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border',
                        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Card details form */}
          <AnimatePresence initial={false}>
            {method.isCard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Card Details</CardTitle>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Lock className="h-3 w-3" /> Encrypted
                    </span>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="cardnum">Card number</Label>
                      <Input id="cardnum" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" className="mt-1.5 tabular-nums" />
                    </div>
                    <div>
                      <Label htmlFor="exp">Expiry</Label>
                      <Input id="exp" placeholder="MM / YY" defaultValue="04 / 28" className="mt-1.5 tabular-nums" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" defaultValue="123" className="mt-1.5 tabular-nums" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="zip">Billing ZIP</Label>
                      <Input id="zip" placeholder="07030" defaultValue="07030" className="mt-1.5 tabular-nums" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
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
                  <span className="text-secondary">Deposit</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Method</span>
                  <span className="font-medium">{method.label}</span>
                </div>
                <AnimatePresence>
                  {bonus > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                        <Gift className="h-4 w-4" /> Deposit bonus
                      </span>
                      <span className="font-semibold tabular-nums text-primary">+{formatCurrency(bonus)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="border-t border-border pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total credited</span>
                    <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(amount + bonus)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={submit} loading={status === 'loading'} disabled={!valid || status === 'success'}>
                {status === 'success' ? (
                  <>
                    <Check className="h-4 w-4" /> Deposited
                  </>
                ) : (
                  `Deposit ${formatCurrency(amount)}`
                )}
              </Button>

              {!valid && <p className="text-center text-xs text-danger">Minimum deposit is {formatCurrency(10)}.</p>}

              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 p-3 text-xs text-secondary">
                <Zap className="h-4 w-4 shrink-0 text-primary" />
                Funds arrive instantly. You can start betting the moment your deposit clears.
              </div>

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" /> PCI-DSS
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-success" /> 256-bit SSL
                </span>
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
                <p className="text-lg font-bold">Deposit complete</p>
                <p className="mt-1 text-sm text-secondary">
                  {formatCurrency(amount + bonus)} is now available in your wallet.
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
