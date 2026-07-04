'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Ticket, Layers, Trophy, Wallet } from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { StatCard, EmptyState } from '@/components/ui/misc';
import { StatusPill } from '@/components/admin/DataTable';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/store/toast';
import { formatCurrency, formatOdds, formatDateTime, cn } from '@/lib/utils';
import type { Bet, BetLeg } from '@/lib/types';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'cashout', label: 'Cashout' },
];

function LegRow({ leg }: { leg: BetLeg }) {
  const result = leg.result ?? 'pending';
  const icon =
    result === 'won' ? <Check className="h-4 w-4 text-success" /> :
    result === 'lost' ? <X className="h-4 w-4 text-danger" /> :
    <Clock className="h-4 w-4 text-muted" />;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{leg.selectionLabel}</p>
        <p className="truncate text-xs text-muted">{leg.eventLabel} · {leg.marketName}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-secondary">{formatOdds(leg.odds)}</span>
    </div>
  );
}

function BetCard({ bet, index }: { bet: Bet; index: number }) {
  const cashout = Number((bet.stake * 1.4).toFixed(2));
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card className="transition-colors hover:border-border/80">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={bet.type === 'parlay' ? 'info' : 'default'}>
                {bet.type === 'parlay' ? `${bet.legs.length}-Leg Parlay` : 'Single'}
              </Badge>
              <StatusPill status={bet.status} />
            </div>
            <span className="text-xs text-muted">{formatDateTime(bet.placedAt)}</span>
          </div>

          <div className="mt-3 divide-y divide-border/50 rounded-lg border border-border/60 bg-surface/50 px-3">
            {bet.legs.map((leg, i) => (
              <LegRow key={`${bet.id}-${i}`} leg={leg} />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Stake</p>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(bet.stake)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Odds</p>
                <p className="text-sm font-semibold tabular-nums">{formatOdds(bet.combinedOdds)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {bet.status === 'won' ? 'Payout' : 'Potential'}
                </p>
                <p className={cn('text-sm font-semibold tabular-nums', bet.status === 'won' ? 'text-success' : 'text-foreground')}>
                  {formatCurrency(bet.potentialPayout)}
                </p>
              </div>
            </div>
            {bet.status === 'pending' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => toast.success('Cash out confirmed', `${formatCurrency(cashout)} added to your balance.`)}
              >
                Cash out {formatCurrency(cashout)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyBetsPage() {
  const user = currentUser();
  const allBets = React.useMemo(
    () =>
      db()
        .bets.filter((b) => b.userId === user.id)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [user.id]
  );
  const [tab, setTab] = React.useState('all');

  const totalStaked = allBets.reduce((s, b) => s + b.stake, 0);
  const totalReturns = allBets.filter((b) => b.status === 'won').reduce((s, b) => s + b.potentialPayout, 0);
  const openBets = allBets.filter((b) => b.status === 'pending').length;

  const filtered = tab === 'all' ? allBets : allBets.filter((b) => b.status === tab);

  const emptyMap: Record<string, { title: string; description: string }> = {
    all: { title: 'No bets yet', description: 'Place your first wager to see it tracked here.' },
    pending: { title: 'No open bets', description: 'You have no bets in play. Head to the sportsbook to get started.' },
    won: { title: 'No winning bets', description: 'Your settled winners will appear here.' },
    lost: { title: 'No lost bets', description: 'Nothing lost here — keep it that way.' },
    cashout: { title: 'No cashed-out bets', description: 'Bets you cash out early will show up here.' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bets</h1>
          <p className="mt-1 text-sm text-secondary">Track every ticket from open to settled, all in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Staked" value={formatCurrency(totalStaked)} icon={Wallet} accent="#3B82F6" sub={`${allBets.length} bets placed`} />
        <StatCard label="Total Returns" value={formatCurrency(totalReturns)} icon={Trophy} accent="#00D66F" sub="From winning tickets" />
        <StatCard label="Open Bets" value={String(openBets)} icon={Ticket} accent="#FFC107" sub="Currently in play" />
        <StatCard label="Parlays" value={String(allBets.filter((b) => b.type === 'parlay').length)} icon={Layers} accent="#A855F7" sub="Multi-leg tickets" />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon={Ticket} title={emptyMap[tab].title} description={emptyMap[tab].description} />
      ) : (
        <div className="space-y-4">
          {filtered.map((bet, i) => (
            <BetCard key={bet.id} bet={bet} index={i} />
          ))}
        </div>
      )}

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
