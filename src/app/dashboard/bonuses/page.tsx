'use client';

import { motion } from 'framer-motion';
import { Gift, Sparkles, Clock } from 'lucide-react';
import { db } from '@/lib/mock/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Progress } from '@/components/ui/misc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { toast } from '@/store/toast';

type ActiveBonus = {
  id: string;
  title: string;
  value: string;
  progress: number;
  wagered: number;
  required: number;
  rolloverRemaining: number;
  expiry: string;
  accent: string;
};

const activeBonuses: ActiveBonus[] = [
  {
    id: 'ab_1',
    title: '$200 Deposit Match',
    value: '$200.00',
    progress: 65,
    wagered: 130,
    required: 200,
    rolloverRemaining: 70,
    expiry: '2026-07-18',
    accent: '#00D66F',
  },
  {
    id: 'ab_2',
    title: '$25 Free Bet',
    value: '$25.00',
    progress: 40,
    wagered: 10,
    required: 25,
    rolloverRemaining: 15,
    expiry: '2026-07-11',
    accent: '#A855F7',
  },
];

type HistoryRow = {
  id: string;
  bonus: string;
  type: string;
  amount: number;
  date: string;
  status: string;
};

const historyRows: HistoryRow[] = [
  { id: 'bh_1', bonus: 'Welcome Deposit Match', type: 'Deposit Match', amount: 500, date: '2026-03-04', status: 'completed' },
  { id: 'bh_2', bonus: 'NBA Playoffs Free Bet', type: 'Free Bet', amount: 25, date: '2026-05-12', status: 'completed' },
  { id: 'bh_3', bonus: 'Refer-a-Friend Bonus', type: 'Referral', amount: 50, date: '2026-06-01', status: 'active' },
  { id: 'bh_4', bonus: 'Weekend Odds Boost Token', type: 'Odds Boost', amount: 10, date: '2026-06-18', status: 'expired' },
  { id: 'bh_5', bonus: 'Reload Match 25%', type: 'Reload', amount: 75, date: '2026-06-27', status: 'active' },
];

const historyColumns: Column<HistoryRow>[] = [
  { key: 'bonus', header: 'Bonus', render: (r) => <span className="font-medium text-foreground">{r.bonus}</span> },
  { key: 'type', header: 'Type', render: (r) => <span className="text-secondary">{r.type}</span> },
  { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="tabular-nums">{formatCurrency(r.amount)}</span> },
  { key: 'date', header: 'Date', render: (r) => <span className="tabular-nums text-secondary">{formatDate(r.date)}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
];

export default function BonusesPage() {
  const promotions = db().promotions;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonuses &amp; Rewards</h1>
          <p className="mt-1 text-sm text-secondary">Track active promos, unlock rewards, and boost your bankroll.</p>
        </div>
      </motion.div>

      {/* Active bonuses */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-3"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Sparkles className="h-4 w-4 text-primary" /> Active bonuses
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeBonuses.map((b) => (
            <Card key={b.id} className="relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${b.accent}, transparent)` }}
              />
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-secondary">{b.title}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: b.accent }}>
                      {b.value}
                    </p>
                  </div>
                  <span
                    className="rounded-md px-2 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${b.accent}1A`, color: b.accent }}
                  >
                    Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span>Wagering progress</span>
                    <span className="tabular-nums font-medium text-foreground">{b.progress}%</span>
                  </div>
                  <Progress value={b.progress} accent={b.accent} />
                  <p className="text-xs tabular-nums text-secondary">
                    {formatCurrency(b.wagered)} of {formatCurrency(b.required)} wagered
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-warning">
                    <Clock className="h-3.5 w-3.5" /> Expires {formatDate(b.expiry)}
                  </span>
                  <span className="tabular-nums text-secondary">
                    <span className="text-foreground font-medium">{formatCurrency(b.rolloverRemaining)}</span> rollover left
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Available promotions */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Gift className="h-4 w-4 text-primary" /> Available promotions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border bg-card p-5 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: `${promo.color}55` }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14] transition-opacity group-hover:opacity-25"
                style={{ background: `radial-gradient(120% 90% at 100% 0%, ${promo.color}, transparent 60%)` }}
              />
              <div className="relative flex flex-1 flex-col">
                <span
                  className="mb-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: `${promo.color}22`, color: promo.color }}
                >
                  {promo.tag}
                </span>
                <h3 className="text-base font-semibold text-foreground">{promo.title}</h3>
                <p className="mt-1 text-sm text-secondary">{promo.subtitle}</p>
                <p className="mt-3 text-xl font-bold tabular-nums" style={{ color: promo.color }}>
                  {promo.value}
                </p>
                <div className="mt-4 flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.success('Opted in', promo.title)}
                >
                  Opt in
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Bonus history */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Badge variant="default">History</Badge>
          <h2 className="text-sm font-semibold text-secondary">Bonus history</h2>
        </div>
        <DataTable columns={historyColumns} rows={historyRows} />
      </motion.section>

      <p className="pt-2 text-center text-xs text-muted">
        21+ and present in eligible states. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
