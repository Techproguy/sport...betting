'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet, Clock, Ticket, TrendingUp, Trophy, TrendingDown, Percent, Target,
  ArrowDownLeft, ArrowUpRight, Gift, Plus, Banknote, Zap, ChevronRight,
} from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { StatCard } from '@/components/ui/misc';
import { AreaTrend } from '@/components/charts/Charts';
import { StatusPill } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/store/toast';
import { formatCurrency, timeAgo, cn } from '@/lib/utils';
import type { Bet } from '@/lib/types';

function betHeadline(b: Bet) {
  if (b.type === 'parlay') return `${b.legs.length}-leg parlay`;
  return b.legs[0]?.selectionLabel ?? 'Selection';
}

function betSub(b: Bet) {
  return b.legs[0]?.eventLabel ?? b.sport;
}

const section = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function DashboardHome() {
  const user = currentUser();
  const allBets = React.useMemo(() => db().bets.filter((b) => b.userId === user.id), [user.id]);
  const txns = React.useMemo(() => db().transactions.filter((t) => t.userId === user.id), [user.id]);
  const promotions = React.useMemo(() => db().promotions.filter((p) => p.featured).slice(0, 3), []);
  const daily = db().series.daily;

  const wonBets = allBets.filter((b) => b.status === 'won');
  const lostBets = allBets.filter((b) => b.status === 'lost');
  const pendingBets = allBets.filter((b) => b.status === 'pending');

  const totalBets = allBets.length;
  const totalWon = wonBets.reduce((s, b) => s + b.potentialPayout, 0);
  const totalLost = lostBets.reduce((s, b) => s + b.stake, 0);
  const totalStaked = allBets.reduce((s, b) => s + b.stake, 0);
  const roi = totalStaked ? ((totalWon - totalLost) / totalStaked) * 100 : 0;
  const decided = wonBets.length + lostBets.length;
  const winRate = decided ? (wonBets.length / decided) * 100 : 0;
  const todaysBets = Math.min(pendingBets.length + 2, totalBets);

  // Deterministic balance-over-time series derived from db().series.daily.
  let running = 3200;
  const balanceSeries = daily.map((d) => {
    running += Math.round((d.deposits - d.withdrawals) / 2400 - 4);
    return { day: d.day, balance: Math.max(500, running) };
  });

  type Activity = {
    id: string;
    icon: typeof Ticket;
    label: string;
    sub: string;
    status: string;
    amount: number;
    date: string;
  };

  const activity: Activity[] = [
    ...allBets.map((b) => ({
      id: b.id,
      icon: Ticket,
      label: betHeadline(b),
      sub: betSub(b),
      status: b.status,
      amount: b.status === 'won' ? b.potentialPayout : -b.stake,
      date: b.placedAt,
    })),
    ...txns.map((t) => ({
      id: t.id,
      icon: t.type === 'deposit' ? ArrowDownLeft : ArrowUpRight,
      label: t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
      sub: t.method,
      status: t.status,
      amount: t.type === 'deposit' ? t.amount : -t.amount,
      date: t.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats = [
    { label: 'Balance', value: formatCurrency(user.balance), icon: Wallet, accent: '#00D66F', sub: 'Available to bet' },
    { label: 'Pending Balance', value: formatCurrency(user.pendingBalance), icon: Clock, accent: '#FFC107', sub: 'In-play & withdrawals' },
    { label: "Today's Bets", value: String(todaysBets), icon: Ticket, accent: '#3B82F6', sub: 'Last 48 hours' },
    { label: 'Total Bets', value: String(totalBets), icon: TrendingUp, accent: '#A855F7', sub: 'All time' },
    { label: 'Total Won', value: formatCurrency(totalWon), icon: Trophy, accent: '#00D66F', sub: `${wonBets.length} winning tickets` },
    { label: 'Total Lost', value: formatCurrency(totalLost), icon: TrendingDown, accent: '#FF4D4F', sub: `${lostBets.length} losing tickets` },
    { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, icon: Percent, accent: roi >= 0 ? '#00D66F' : '#FF4D4F', sub: 'Return on stake' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: Target, accent: '#22D3EE', sub: `${wonBets.length}/${decided} settled` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...section(0)} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Alex</h1>
          <p className="mt-1 text-sm text-secondary">
            Here is how your book is looking today, Saturday. You have {pendingBets.length} open{' '}
            {pendingBets.length === 1 ? 'ticket' : 'tickets'} in play.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/deposit">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Deposit
            </Button>
          </Link>
          <Link href="/sports">
            <Button size="sm" variant="outline">
              <Zap className="h-4 w-4" /> Place a bet
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} sub={s.sub} />
        ))}
      </div>

      {/* Chart + Active bets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...section(0.05)} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-end justify-between">
              <div>
                <CardTitle>Balance over time</CardTitle>
                <CardDescription>Rolling account balance across the last 30 days</CardDescription>
              </div>
              <span className="text-sm font-semibold text-success tabular-nums">{formatCurrency(user.balance)}</span>
            </CardHeader>
            <CardContent>
              <AreaTrend data={balanceSeries} x="day" y="balance" format={formatCurrency} height={260} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...section(0.1)}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Active bets</CardTitle>
              <Link href="/dashboard/bets" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingBets.length === 0 && (
                <p className="py-6 text-center text-sm text-muted">No open bets right now.</p>
              )}
              {pendingBets.slice(0, 4).map((b) => {
                const cashout = Number((b.stake * 1.4).toFixed(2));
                return (
                  <div key={b.id} className="rounded-lg border border-border bg-surface/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{betHeadline(b)}</p>
                        <p className="truncate text-xs text-muted">{betSub(b)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-success">
                        {formatCurrency(b.potentialPayout)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-3 w-full"
                      onClick={() => toast.success('Cash out confirmed', `${formatCurrency(cashout)} added to your balance.`)}
                    >
                      Cash out {formatCurrency(cashout)}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent activity + Promotions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div {...section(0.05)} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent activity</CardTitle>
              <Link href="/dashboard/wallet" className="text-xs font-semibold text-primary hover:underline">
                See history
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {activity.map((a) => {
                const Icon = a.icon;
                const positive = a.amount >= 0;
                return (
                  <div key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-secondary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.label}</p>
                      <p className="truncate text-xs text-muted">{a.sub} · {timeAgo(a.date)}</p>
                    </div>
                    <StatusPill status={a.status} />
                    <span className={cn('w-24 shrink-0 text-right text-sm font-semibold tabular-nums', positive ? 'text-success' : 'text-foreground')}>
                      {positive ? '+' : '-'}{formatCurrency(Math.abs(a.amount))}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...section(0.1)} className="space-y-4">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-lg border border-border p-5"
              style={{ background: `linear-gradient(135deg, ${p.color}26, transparent 70%)` }}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-2xl"
                style={{ background: p.color }}
              />
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4" style={{ color: p.color }} />
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: p.color }}>
                  {p.tag}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold leading-snug">{p.title}</p>
              <p className="mt-1 text-xs text-secondary">{p.subtitle}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold tabular-nums" style={{ color: p.color }}>{p.value}</span>
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => toast.success('Offer opted in', `${p.title} is now active on your account.`)}
                >
                  {p.cta} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div {...section(0.05)}>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Move money or find your next bet in one tap</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/dashboard/deposit" className="w-full">
              <Button className="w-full">
                <Plus className="h-4 w-4" /> Deposit
              </Button>
            </Link>
            <Link href="/dashboard/withdraw" className="w-full">
              <Button variant="secondary" className="w-full">
                <Banknote className="h-4 w-4" /> Withdraw
              </Button>
            </Link>
            <Link href="/sports" className="w-full">
              <Button variant="outline" className="w-full">
                <Zap className="h-4 w-4" /> Place a bet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
