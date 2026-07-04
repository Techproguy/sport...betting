'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Clock, PauseCircle, ShieldOff, Phone, LifeBuoy, Check, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input, Label, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch, Divider } from '@/components/ui/misc';
import { toast } from '@/store/toast';
import { cn, formatCurrency } from '@/lib/utils';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

type LimitKey = 'daily' | 'weekly' | 'monthly';
const LIMIT_META: { key: LimitKey; label: string; hint: string }[] = [
  { key: 'daily', label: 'Daily limit', hint: 'Resets every 24 hours' },
  { key: 'weekly', label: 'Weekly limit', hint: 'Resets every Monday' },
  { key: 'monthly', label: 'Monthly limit', hint: 'Resets on the 1st' },
];

const COOLING_OPTIONS = [
  { value: '24h', label: '24 hours', desc: 'A short break to reset.' },
  { value: '7d', label: '7 days', desc: 'A full week away.' },
  { value: '30d', label: '30 days', desc: 'A month to refocus.' },
];

const EXCLUSION_OPTIONS = [
  { value: '6m', label: '6 months', desc: 'Temporary self-exclusion.' },
  { value: '1y', label: '1 year', desc: 'Extended break from play.' },
  { value: 'perm', label: 'Permanent', desc: 'Close account indefinitely.' },
];

export default function ResponsibleGamblingPage() {
  const [current] = useState<Record<LimitKey, number>>({ daily: 500, weekly: 2000, monthly: 5000 });
  const [limits, setLimits] = useState<Record<LimitKey, string>>({ daily: '500', weekly: '2000', monthly: '5000' });

  const [remindersOn, setRemindersOn] = useState(true);
  const [interval, setIntervalValue] = useState('60');

  const [cooling, setCooling] = useState<string | null>(null);
  const [exclusion, setExclusion] = useState<string | null>(null);

  const [modal, setModal] = useState<null | { kind: 'cooling' | 'exclusion'; label: string }>(null);

  const saveLimits = () => toast.success('Deposit limits saved', 'Your new limits are now active.');

  const confirmModal = () => {
    if (!modal) return;
    if (modal.kind === 'cooling') {
      toast.success('Cooling-off started', `You have paused play for ${modal.label}.`);
    } else {
      toast.warning('Self-exclusion confirmed', `Your account is excluded for ${modal.label}.`);
    }
    setModal(null);
  };

  return (
    <div className="space-y-6">
      <motion.div {...fade(0)} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Responsible Gambling</h1>
          <p className="mt-1 text-sm text-secondary">Tools to help you stay in control and play safely.</p>
        </div>
        <Badge variant="info">21+ Play responsibly</Badge>
      </motion.div>

      {/* Intro */}
      <motion.div {...fade(0.05)}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-4 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Betting should always feel like entertainment</p>
              <p className="text-sm text-secondary">
                We&apos;re here to help you keep it that way. Set limits, take breaks, and reach out for support whenever
                you need it — no judgment, just help. These tools take effect immediately and can be adjusted at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deposit limits */}
      <motion.div {...fade(0.1)}>
        <Card>
          <CardHeader>
            <CardTitle>Deposit limits</CardTitle>
            <CardDescription>Cap how much you can deposit over each period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {LIMIT_META.map(({ key, label, hint }) => {
              const parsed = Number(limits[key]) || 0;
              const changed = parsed !== current[key];
              return (
                <div key={key} className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`limit-${key}`}>{label}</Label>
                    <p className="text-xs text-muted">{hint}</p>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                      <Input
                        id={`limit-${key}`}
                        type="number"
                        min={0}
                        className="pl-7 tabular-nums"
                        value={limits[key]}
                        onChange={(e) => setLimits((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted">Current</p>
                    <p className="tabular-nums font-medium">{formatCurrency(current[key])}</p>
                    {changed && (
                      <p className="tabular-nums text-primary">→ {formatCurrency(parsed)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardContent className="pt-0">
            <Button onClick={saveLimits}>Save limits</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reminders */}
      <motion.div {...fade(0.15)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Session reminders
            </CardTitle>
            <CardDescription>Get a gentle nudge showing how long you&apos;ve been playing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable reminders</p>
                <p className="text-sm text-secondary">Reality-check pop-ups during long sessions.</p>
              </div>
              <Switch
                checked={remindersOn}
                onChange={(v) => {
                  setRemindersOn(v);
                  toast.info(v ? 'Reminders enabled' : 'Reminders disabled');
                }}
              />
            </div>
            {remindersOn && (
              <>
                <Divider />
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="interval">Reminder interval</Label>
                  <Select
                    id="interval"
                    value={interval}
                    onChange={(e) => {
                      setIntervalValue(e.target.value);
                      toast.info('Reminder interval updated', `Every ${e.target.value} minutes.`);
                    }}
                  >
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every 60 minutes</option>
                    <option value="90">Every 90 minutes</option>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cooling-off */}
      <motion.div {...fade(0.2)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PauseCircle className="h-5 w-5 text-warning" /> Cooling-off period
            </CardTitle>
            <CardDescription>Take a short, defined break. Your account reactivates automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {COOLING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setCooling(o.value)}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    cooling === o.value
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-surface hover:border-primary/40'
                  )}
                >
                  <p className="text-base font-semibold">{o.label}</p>
                  <p className="mt-0.5 text-xs text-secondary">{o.desc}</p>
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              disabled={!cooling}
              onClick={() => {
                const opt = COOLING_OPTIONS.find((o) => o.value === cooling);
                if (opt) setModal({ kind: 'cooling', label: opt.label });
              }}
            >
              Start cooling-off
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Self-exclusion */}
      <motion.div {...fade(0.25)}>
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-danger" /> Self-exclusion
            </CardTitle>
            <CardDescription>
              A longer break. During self-exclusion you cannot bet, deposit, or reopen your account early.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {EXCLUSION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setExclusion(o.value)}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    exclusion === o.value
                      ? 'border-danger bg-danger/10 ring-1 ring-danger'
                      : 'border-border bg-surface hover:border-danger/40'
                  )}
                >
                  <p className="text-base font-semibold">{o.label}</p>
                  <p className="mt-0.5 text-xs text-secondary">{o.desc}</p>
                </button>
              ))}
            </div>
            <Button
              variant="danger"
              disabled={!exclusion}
              onClick={() => {
                const opt = EXCLUSION_OPTIONS.find((o) => o.value === exclusion);
                if (opt) setModal({ kind: 'exclusion', label: opt.label });
              }}
            >
              Request self-exclusion
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources */}
      <motion.div {...fade(0.3)}>
        <Card className="bg-elevated">
          <CardContent className="space-y-5 py-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">24/7 confidential helpline</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight text-gradient">1-800-GAMBLER</p>
                </div>
              </div>
              <a href="tel:1-800-426-2537">
                <Button variant="outline">
                  <LifeBuoy className="h-4 w-4" /> Get support
                </Button>
              </a>
            </div>
            <Divider />
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">National Council on Problem Gambling</p>
                <p className="text-secondary">Confidential help, chat, and text support at ncpgambling.org.</p>
              </div>
              <div>
                <p className="font-medium">Self-help &amp; screening tools</p>
                <p className="text-secondary">Take a self-assessment and find local resources any time.</p>
              </div>
            </div>
            <p className="text-xs text-muted">
              Must be 21+ to play. If you or someone you know has a gambling problem, help is available. Call or text
              1-800-GAMBLER.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setModal(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    modal.kind === 'exclusion' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                  )}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">
                    {modal.kind === 'exclusion' ? 'Confirm self-exclusion' : 'Confirm cooling-off'}
                  </h2>
                  <p className="text-sm text-secondary">
                    {modal.kind === 'exclusion'
                      ? `You're about to self-exclude for ${modal.label}. You won't be able to bet or deposit, and this cannot be reversed early.`
                      : `You're about to pause play for ${modal.label}. Your account will reactivate automatically when it ends.`}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="danger" onClick={confirmModal}>
                  <Check className="h-4 w-4" /> Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
