'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, Activity, AlertTriangle, Flame, Radio } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, SeverityPill, type Column } from '@/components/admin/DataTable';
import { StatCard, Progress, Switch } from '@/components/ui/misc';
import { Donut } from '@/components/charts/Charts';
import { toast } from '@/store/toast';
import { db } from '@/lib/mock/db';
import { formatCurrency, formatCompact } from '@/lib/utils';

// Deterministic hash — no Math.random at render time.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const PALETTE = [
  '#00D66F', '#3B82F6', '#FFC107', '#FF4D4F', '#A855F7',
  '#22D3EE', '#EC4899', '#FB923C', '#14B8A6', '#F472B6',
];

const MARKETS = ['Moneyline', 'Spread', 'Total', 'Props', 'Futures'] as const;

type Level = 'low' | 'medium' | 'high' | 'critical';

function levelFromRatio(r: number): Level {
  if (r >= 0.85) return 'critical';
  if (r >= 0.65) return 'high';
  if (r >= 0.4) return 'medium';
  return 'low';
}

const LEVEL_ACCENT: Record<Level, string> = {
  low: '#3B82F6',
  medium: '#FFC107',
  high: '#FF4D4F',
  critical: '#FF4D4F',
};

// Interpolate green -> amber -> red for the heat map.
function heatColor(t: number): string {
  const stops = [
    [0, 214, 111],
    [255, 193, 7],
    [255, 77, 79],
  ];
  const clamped = Math.min(1, Math.max(0, t));
  const seg = clamped < 0.5 ? 0 : 1;
  const local = clamped < 0.5 ? clamped / 0.5 : (clamped - 0.5) / 0.5;
  const a = stops[seg];
  const b = stops[seg + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * local);
  const g = Math.round(a[1] + (b[1] - a[1]) * local);
  const bl = Math.round(a[2] + (b[2] - a[2]) * local);
  return `rgba(${r}, ${g}, ${bl}, ${(0.12 + clamped * 0.62).toFixed(3)})`;
}

interface RiskRow {
  id: string;
  label: string;
  sport: string;
  handle: number;
  liability: number;
  ratio: number;
  level: Level;
}

const ALERTS: { id: string; level: Level; message: string; time: string }[] = [
  { id: 'al1', level: 'critical', message: 'NBA moneyline exposure exceeded 80% of book cap ($720K liability).', time: '2m ago' },
  { id: 'al2', level: 'high', message: 'Sharp action detected on Chiefs -3.5 — line moved 3.5 → 2.5 in 90s.', time: '11m ago' },
  { id: 'al3', level: 'medium', message: 'Correlated parlay cluster on Lakers/Warriors totals flagged for review.', time: '26m ago' },
  { id: 'al4', level: 'high', message: 'Soccer draw-no-bet liability spiking on 3 concurrent EPL fixtures.', time: '48m ago' },
  { id: 'al5', level: 'low', message: 'Tennis futures exposure normalized after auto-limit adjustment.', time: '1h ago' },
];

export default function RiskManagementPage() {
  const data = React.useMemo(() => db(), []);
  const sportVolume = data.series.sportVolume;

  const totalExposure = React.useMemo(
    () => sportVolume.reduce((sum, s) => sum + s.exposure, 0),
    [sportVolume]
  );
  const maxSportExposure = React.useMemo(
    () => Math.max(...sportVolume.map((s) => s.exposure)),
    [sportVolume]
  );
  const openBets = React.useMemo(
    () => data.bets.filter((b) => b.status === 'pending').length,
    [data.bets]
  );
  const worstCase = Math.round(totalExposure * 1.35 + maxSportExposure * 0.5);
  const maxLiability = maxSportExposure;

  const donutData = React.useMemo(
    () =>
      sportVolume.map((s, i) => ({
        name: s.sport,
        value: s.exposure,
        color: PALETTE[i % PALETTE.length],
      })),
    [sportVolume]
  );

  // Deterministic per-event exposure derived from betCount + id hash.
  const rows = React.useMemo<RiskRow[]>(() => {
    const derived = data.events.map((e) => {
      const h = hash(e.id);
      const liability = e.betCount * 55 + (h % 90_000) + 12_000;
      const handle = Math.round(liability * (2.1 + (h % 60) / 100));
      return {
        id: e.id,
        label: `${e.away.short} @ ${e.home.short}`,
        sport: e.sport,
        handle,
        liability,
        ratio: 0,
        level: 'low' as Level,
      };
    });
    const maxLiab = Math.max(...derived.map((d) => d.liability));
    derived.forEach((d) => {
      d.ratio = d.liability / maxLiab;
      d.level = levelFromRatio(d.ratio);
    });
    return derived.sort((a, b) => b.liability - a.liability).slice(0, 8);
  }, [data.events]);

  const [autoLimit, setAutoLimit] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const r of rows) init[r.id] = r.level === 'critical' || r.level === 'high';
    return init;
  });

  const toggleAutoLimit = (row: RiskRow) => {
    setAutoLimit((prev) => {
      const next = { ...prev, [row.id]: !prev[row.id] };
      toast.info(
        next[row.id] ? 'Auto-limit enabled' : 'Auto-limit disabled',
        `${row.label} · ${row.sport}`
      );
      return next;
    });
  };

  const columns: Column<RiskRow>[] = [
    {
      key: 'event',
      header: 'Event',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{r.label}</span>
          <span className="text-[11px] uppercase tracking-wide text-muted">{r.sport}</span>
        </div>
      ),
    },
    {
      key: 'handle',
      header: 'Handle',
      align: 'right',
      render: (r) => <span className="font-mono tabular-nums text-secondary">{formatCurrency(r.handle)}</span>,
    },
    {
      key: 'liability',
      header: 'Liability',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-24">
            <Progress value={r.ratio * 100} accent={LEVEL_ACCENT[r.level]} />
          </div>
          <span className="font-mono tabular-nums text-foreground">{formatCurrency(r.liability)}</span>
        </div>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      align: 'center',
      render: (r) => <SeverityPill level={r.level} />,
    },
    {
      key: 'auto',
      header: 'Auto-limit',
      align: 'center',
      render: (r) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <Switch checked={!!autoLimit[r.id]} onChange={() => toggleAutoLimit(r)} />
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Risk Management">
      <div className="space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total exposure"
            value={formatCurrency(totalExposure)}
            delta="+6.4%"
            icon={ShieldAlert}
            accent="#00D66F"
            sub="Open liability across book"
          />
          <StatCard
            label="Max liability"
            value={formatCurrency(maxLiability)}
            delta="+2.1%"
            icon={TrendingUp}
            accent="#3B82F6"
            sub="Largest single-sport hold"
          />
          <StatCard
            label="Open bets"
            value={formatCompact(openBets)}
            icon={Activity}
            accent="#FFC107"
            sub="Pending settlement"
          />
          <StatCard
            label="VaR / worst-case"
            value={formatCurrency(worstCase)}
            delta="-1.3%"
            icon={AlertTriangle}
            accent="#FF4D4F"
            sub="99% correlated-loss scenario"
          />
        </div>

        {/* Exposure by sport: bar list + donut */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Exposure by sport</h3>
              <span className="text-xs text-muted">liability held</span>
            </div>
            <div className="space-y-3">
              {sportVolume.map((s, i) => {
                const color = PALETTE[i % PALETTE.length];
                const width = (s.exposure / maxSportExposure) * 100;
                return (
                  <div key={s.sport} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs font-medium text-secondary">{s.sport}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded-md bg-elevated">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                        className="flex h-full items-center justify-end rounded-md pr-2"
                        style={{ background: `linear-gradient(90deg, ${color}55, ${color})` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
                      {formatCompact(s.exposure)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Exposure share</h3>
              <span className="text-xs text-muted">{formatCurrency(totalExposure)} total</span>
            </div>
            <Donut data={donutData} height={240} />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-secondary">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exposure by event table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Exposure by event</h3>
            <span className="text-xs text-muted">top {rows.length} by liability</span>
          </div>
          <DataTable<RiskRow>
            columns={columns}
            rows={rows}
            onRowClick={(r) =>
              toast.info(r.label, `${r.sport} · liability ${formatCurrency(r.liability)}`)
            }
          />
        </div>

        {/* Heat map + alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-danger" />
                <h3 className="text-sm font-semibold">Risk heat map</h3>
              </div>
              <span className="text-xs text-muted">exposure intensity by market</span>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[560px]">
                {/* Header row */}
                <div
                  className="grid gap-1.5 pb-1.5"
                  style={{ gridTemplateColumns: `96px repeat(${MARKETS.length}, 1fr)` }}
                >
                  <span />
                  {MARKETS.map((m) => (
                    <span key={m} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {m}
                    </span>
                  ))}
                </div>
                {/* Rows */}
                <div className="space-y-1.5">
                  {sportVolume.map((s) => (
                    <div
                      key={s.sport}
                      className="grid items-center gap-1.5"
                      style={{ gridTemplateColumns: `96px repeat(${MARKETS.length}, 1fr)` }}
                    >
                      <span className="text-xs font-medium text-secondary">{s.sport}</span>
                      {MARKETS.map((m) => {
                        const intensity = (hash(`${s.sport}:${m}`) % 100) / 100;
                        const pct = Math.round(intensity * 100);
                        return (
                          <div
                            key={m}
                            title={`${s.sport} · ${m} — ${pct}% of cap`}
                            className="flex h-10 items-center justify-center rounded-md border border-border/40 text-[11px] font-semibold tabular-nums text-foreground/80 transition-transform hover:scale-[1.04]"
                            style={{ background: heatColor(intensity) }}
                          >
                            {pct}%
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live alerts feed */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary animate-pulse-live" />
                <h3 className="text-sm font-semibold">Live risk alerts</h3>
              </div>
              <span className="text-xs text-muted">real-time</span>
            </div>
            <div className="space-y-3">
              {ALERTS.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="rounded-lg border border-border/60 bg-surface/60 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <SeverityPill level={a.level} />
                    <span className="shrink-0 text-[11px] text-muted">{a.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-secondary">{a.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
