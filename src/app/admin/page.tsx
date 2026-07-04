'use client';

import { motion } from 'framer-motion';
import {
  Users, Wifi, DollarSign, TrendingUp, Wallet, ArrowUpFromLine, FileCheck,
  Radio, ShieldAlert, ScrollText, Activity, ArrowRight,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { SeverityPill } from '@/components/admin/DataTable';
import { Lines, Bars, MultiArea } from '@/components/charts/Charts';
import { db } from '@/lib/mock/db';
import { formatCurrency, formatCompact, formatNumber, timeAgo, cn } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';

function seedFrom(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function exposureFor(id: string) {
  return 8000 + (seedFrom(id) % 240000);
}
function sportIcon(sport: string) {
  return SPORTS.find((s) => s.key === sport)?.icon ?? '🎯';
}

export default function AdminDashboardPage() {
  const { users, bets, transactions, kyc, fraud, audit, events, series } = db();

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const onlineUsers = Math.round(activeUsers * 0.37) + 6;
  const monthHandle = series.revenue[6].handle;
  const todayHandle = Math.round(monthHandle / 30);
  const ggr = series.revenue[6].ggr;
  const net = series.revenue[6].revenue;

  const pendingWithdrawals = transactions.filter(
    (t) => t.type === 'withdrawal' && (t.status === 'pending' || t.status === 'processing')
  );
  const pendingWithdrawSum = pendingWithdrawals.reduce((a, t) => a + t.amount, 0);
  const pendingKyc = kyc.filter((k) => k.status === 'pending').length;
  const liveEvents = events.filter((e) => e.status === 'live');
  const openBets = bets.filter((b) => b.status === 'pending');
  const openLiability = openBets.reduce((a, b) => a + (b.potentialPayout - b.stake), 0);

  const cards = [
    { label: 'Active Users', value: formatNumber(activeUsers), delta: '+4.2%', icon: Users, accent: '#00D66F', sub: `${users.length} total accounts` },
    { label: 'Online Now', value: formatNumber(onlineUsers), delta: '+12.8%', icon: Wifi, accent: '#3B82F6', sub: 'Live sessions' },
    { label: "Today's Handle", value: formatCurrency(todayHandle), delta: '+8.1%', icon: DollarSign, accent: '#FFC107', sub: 'Amount wagered' },
    { label: 'Gross Gaming Rev', value: formatCurrency(ggr), delta: '+6.4%', icon: TrendingUp, accent: '#00D66F', sub: 'MTD GGR' },
    { label: 'Net Profit', value: formatCurrency(net), delta: '+5.0%', icon: Wallet, accent: '#22D3EE', sub: 'After bonuses' },
    { label: 'Pending Withdrawals', value: formatNumber(pendingWithdrawals.length), delta: '-2.3%', icon: ArrowUpFromLine, accent: '#A855F7', sub: formatCurrency(pendingWithdrawSum) },
    { label: 'Pending KYC', value: formatNumber(pendingKyc), delta: '+1.1%', icon: FileCheck, accent: '#FB923C', sub: 'Awaiting review' },
    { label: 'Live Events', value: formatNumber(liveEvents.length), icon: Radio, accent: '#FF4D4F', sub: 'In-play now' },
    { label: 'Risk Exposure', value: formatCurrency(openLiability), delta: '+3.7%', icon: ShieldAlert, accent: '#FF4D4F', sub: `${openBets.length} open bets` },
  ];

  const feed = [
    ...audit.slice(0, 8).map((a) => ({
      id: a.id, kind: 'audit' as const, title: a.action, meta: `${a.actor} · ${a.target}`, time: a.timestamp, sev: '',
    })),
    ...fraud.slice(0, 6).map((f) => ({
      id: f.id, kind: 'fraud' as const, title: f.type, meta: `${f.userName} · ${f.ip}`, time: f.detectedAt, sev: f.severity,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return (
    <AdminPage title="Dashboard">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-lg border border-border bg-card p-5 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue &amp; GGR</h3>
              <p className="text-xs text-muted">Monthly handle-adjusted performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />GGR</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Revenue</span>
            </div>
          </div>
          <Lines data={series.revenue} height={280} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-lg border border-border bg-card p-5"
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Betting Volume (24h)</h3>
            <p className="text-xs text-muted">Bets placed per hour</p>
          </div>
          <Bars data={series.hourly} x="hour" y="bets" color="#3B82F6" height={280} format={(v) => formatCompact(v)} />
        </motion.div>
      </div>

      {/* Deposits vs Withdrawals */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Deposits vs Withdrawals</h3>
            <p className="text-xs text-muted">Rolling 30-day cash flow</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Deposits</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />Withdrawals</span>
          </div>
        </div>
        <MultiArea data={series.daily} height={260} />
      </motion.div>

      {/* Bottom two-column */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Live events */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
              </span>
              Live Events
            </h3>
            <span className="text-xs text-muted">{liveEvents.length} in-play</span>
          </div>
          <div className="divide-y divide-border/60">
            {liveEvents.slice(0, 6).map((e) => {
              const exp = exposureFor(e.id);
              const sev = exp > 180000 ? 'high' : exp > 90000 ? 'medium' : 'low';
              return (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-lg">{sportIcon(e.sport)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.away.short} @ {e.home.short}</p>
                    <p className="text-xs text-muted">{e.league} · {e.clock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">{e.scoreAway}–{e.scoreHome}</p>
                    <p className="text-[11px] text-muted tabular-nums">{formatCompact(e.betCount)} bets</p>
                  </div>
                  <div className="w-[86px] text-right">
                    <p className="text-xs font-semibold tabular-nums">{formatCurrency(exp)}</p>
                    <SeverityPill level={sev} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity / alerts feed */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" />Recent Activity &amp; Alerts</h3>
            <ArrowRight className="h-4 w-4 text-muted" />
          </div>
          <div className="divide-y divide-border/60">
            {feed.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                <div className={cn(
                  'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                  item.kind === 'fraud' ? 'bg-danger/12 text-danger' : 'bg-elevated text-secondary'
                )}>
                  {item.kind === 'fraud' ? <ShieldAlert className="h-4 w-4" /> : <ScrollText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted">{item.meta}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-[11px] text-muted">{timeAgo(item.time)}</span>
                  {item.kind === 'fraud' && item.sev && <SeverityPill level={item.sev} />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminPage>
  );
}
