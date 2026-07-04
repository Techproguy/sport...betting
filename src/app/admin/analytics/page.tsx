'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Users,
  Percent,
  MapPin,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard, Progress } from '@/components/ui/misc';
import { Lines, AreaTrend, MultiArea, Bars, Donut } from '@/components/charts/Charts';
import { Tabs } from '@/components/ui/tabs';
import { db } from '@/lib/mock/db';
import { formatCurrency, formatCompact } from '@/lib/utils';

// ---- deterministic hash (no render-time Math.random) ----
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

// Deterministic signed delta label from a seed string.
function deltaLabel(seed: string): string {
  const h = hash(seed);
  const magnitude = (h % 180) / 10 + 1.2; // 1.2 – 19.2
  const positive = h % 5 !== 0; // mostly up, some down — deterministic
  const v = magnitude.toFixed(1);
  return `${positive ? '+' : '-'}${v}%`;
}

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '12 months' },
];

const RANGE_META: Record<string, { caption: string; span: string }> = {
  '7d': { caption: 'vs previous 7 days', span: 'Last 7 days' },
  '30d': { caption: 'vs previous 30 days', span: 'Last 30 days' },
  '90d': { caption: 'vs previous quarter', span: 'Last 90 days' },
  '1y': { caption: 'vs previous 12 months', span: 'Last 12 months' },
};

// Win/Loss donut palette (status -> color)
const STATUS_COLORS: Record<string, string> = {
  won: '#00D66F',
  lost: '#FF4D4F',
  pending: '#FFC107',
  cashout: '#3B82F6',
  void: '#6B6B6B',
};
const STATUS_LABEL: Record<string, string> = {
  won: 'Won',
  lost: 'Lost',
  pending: 'Pending',
  cashout: 'Cashed out',
  void: 'Void',
};

const GEO_STATES = ['NJ', 'PA', 'NY', 'MI', 'AZ', 'CO', 'IL', 'VA'];
const STATE_NAME: Record<string, string> = {
  NJ: 'New Jersey',
  PA: 'Pennsylvania',
  NY: 'New York',
  MI: 'Michigan',
  AZ: 'Arizona',
  CO: 'Colorado',
  IL: 'Illinois',
  VA: 'Virginia',
};

const WEEKS = [0, 1, 2, 3, 4, 5];

// Retention % for a cohort month & week — deterministic, decaying.
function retention(month: string, week: number): number {
  if (week === 0) return 100;
  const jitter = hash(`${month}:${week}`) % 9;
  const base = 100 * Math.pow(0.7, week);
  return Math.max(6, Math.round(base - jitter));
}

// Sequential single-hue (green) intensity for a retention value.
function cohortStyle(value: number): CSSProperties {
  const t = value / 100;
  const alpha = 0.06 + 0.82 * t;
  return {
    background: `rgba(0, 214, 111, ${alpha.toFixed(3)})`,
    color: t > 0.55 ? '#031B10' : '#E6FFF2',
  };
}

function Panel({
  title,
  meta,
  className,
  children,
  index = 0,
}: {
  title: string;
  meta?: string;
  className?: string;
  children: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className={`rounded-lg border border-border bg-card p-5 ${className ?? ''}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {meta && <span className="text-xs text-muted">{meta}</span>}
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const data = db();
  const meta = RANGE_META[range];

  const kpis = useMemo(() => {
    const rev = data.series.revenue;
    const handle = rev.reduce((s, r) => s + r.handle, 0);
    const ggr = rev.reduce((s, r) => s + r.ggr, 0);
    const net = rev.reduce((s, r) => s + r.revenue, 0);
    const activeUsers = rev[rev.length - 1]?.users ?? data.users.length;
    const hold = handle > 0 ? (ggr / handle) * 100 : 0;
    return { handle, ggr, net, activeUsers, hold };
  }, [data]);

  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of data.bets) counts[b.status] = (counts[b.status] ?? 0) + 1;
    return (['won', 'lost', 'pending', 'cashout', 'void'] as const)
      .map((k) => ({ name: STATUS_LABEL[k], value: counts[k] ?? 0, color: STATUS_COLORS[k] }))
      .filter((d) => d.value > 0);
  }, [data]);

  const cohortMonths = useMemo(
    () => data.series.revenue.slice(-6).map((r) => r.month),
    [data]
  );

  const geo = useMemo(() => {
    const rows = GEO_STATES.map((code) => ({
      code,
      name: STATE_NAME[code],
      value: 480_000 + (hash(`geo:${code}`) % 4_200_000),
    }));
    rows.sort((a, b) => b.value - a.value);
    const max = rows[0]?.value ?? 1;
    return { rows, max };
  }, []);

  return (
    <AdminPage title="Analytics">
      <div className="space-y-6">
        {/* Range toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-secondary">
              Performance overview
              <span className="mx-2 text-muted">·</span>
              <span className="font-medium text-foreground">{meta.span}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Deterministic demo data · figures {meta.caption}
            </p>
          </div>
          <Tabs
            tabs={RANGES}
            value={range}
            onChange={setRange}
            className="w-full sm:w-auto"
          />
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Total handle"
            value={formatCurrency(kpis.handle)}
            delta={deltaLabel(`handle:${range}`)}
            icon={DollarSign}
            accent="#00D66F"
            sub={meta.caption}
          />
          <StatCard
            label="GGR"
            value={formatCurrency(kpis.ggr)}
            delta={deltaLabel(`ggr:${range}`)}
            icon={TrendingUp}
            accent="#3B82F6"
            sub="Gross gaming revenue"
          />
          <StatCard
            label="Net revenue"
            value={formatCurrency(kpis.net)}
            delta={deltaLabel(`net:${range}`)}
            icon={Wallet}
            accent="#A855F7"
            sub="After bonuses & fees"
          />
          <StatCard
            label="Active users"
            value={formatCompact(kpis.activeUsers)}
            delta={deltaLabel(`users:${range}`)}
            icon={Users}
            accent="#22D3EE"
            sub="Monthly active"
          />
          <StatCard
            label="Hold %"
            value={`${kpis.hold.toFixed(1)}%`}
            delta={deltaLabel(`hold:${range}`)}
            icon={Percent}
            accent="#FFC107"
            sub="GGR / handle"
          />
        </div>

        {/* Revenue + Users growth */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Revenue & GGR" meta={meta.span} className="lg:col-span-2" index={0}>
            <div className="mb-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary" /> GGR
              </span>
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="h-2 w-2 rounded-full bg-warning" /> Net revenue
              </span>
            </div>
            <Lines data={data.series.revenue} height={280} />
          </Panel>

          <Panel title="User growth" meta="MAU" index={1}>
            <AreaTrend
              data={data.series.revenue}
              x="month"
              y="users"
              color="#A855F7"
              height={280}
              format={(v) => formatCompact(v)}
            />
          </Panel>
        </div>

        {/* Deposits/Withdrawals + Sports + Win-Loss */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Deposits vs Withdrawals (30d)" meta="Daily flow" className="lg:col-span-2" index={0}>
            <div className="mb-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary" /> Deposits
              </span>
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="h-2 w-2 rounded-full bg-info" /> Withdrawals
              </span>
            </div>
            <MultiArea data={data.series.daily} height={260} />
          </Panel>

          <Panel title="Win / Loss ratio" meta={`${formatCompact(data.bets.length)} bets`} index={1}>
            <Donut data={donutData} height={200} />
            <div className="mt-4 space-y-2">
              {donutData.map((d) => {
                const total = donutData.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? (d.value / total) * 100 : 0;
                return (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-secondary">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatCompact(d.value)}
                      <span className="ml-1.5 text-muted">{pct.toFixed(0)}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Sports volume */}
        <Panel title="Handle by sport" meta="Volume by market">
          <Bars
            data={data.series.sportVolume}
            x="sport"
            y="volume"
            color="#22D3EE"
            height={260}
            format={(v) => formatCompact(v)}
          />
        </Panel>

        {/* Cohort retention + Geographic */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Cohort retention" meta="By signup month" className="lg:col-span-2" index={0}>
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[520px]">
                {/* header */}
                <div className="grid grid-cols-[110px_repeat(6,1fr)] gap-1.5 pb-1.5">
                  <div className="text-xs font-medium text-muted">Cohort</div>
                  {WEEKS.map((w) => (
                    <div key={w} className="text-center text-xs font-medium text-muted">
                      Week {w}
                    </div>
                  ))}
                </div>
                {cohortMonths.map((month) => (
                  <div
                    key={month}
                    className="grid grid-cols-[110px_repeat(6,1fr)] gap-1.5 py-0.5"
                  >
                    <div className="flex items-center text-xs font-medium text-secondary">
                      {month} cohort
                    </div>
                    {WEEKS.map((w) => {
                      const val = retention(month, w);
                      return (
                        <div
                          key={w}
                          title={`${month} · Week ${w} · ${val}% retained`}
                          className="flex h-9 items-center justify-center rounded-md text-xs font-semibold tabular-nums"
                          style={cohortStyle(val)}
                        >
                          {val}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">
              Share of each signup cohort still active N weeks after registration.
            </p>
          </Panel>

          <Panel title="Top states" meta="Handle by geography" index={1}>
            <div className="space-y-3.5">
              {geo.rows.map((s) => (
                <div key={s.code}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-info" />
                      <span className="font-semibold">{s.code}</span>
                      <span className="text-muted">{s.name}</span>
                    </span>
                    <span className="tabular-nums font-medium text-secondary">
                      {formatCurrency(s.value)}
                    </span>
                  </div>
                  <Progress value={(s.value / geo.max) * 100} accent="#3B82F6" />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <p className="pt-2 text-center text-xs text-muted">
          Analytics reflect simulated demo activity. 21+ · Please play responsibly.
        </p>
      </div>
    </AdminPage>
  );
}
