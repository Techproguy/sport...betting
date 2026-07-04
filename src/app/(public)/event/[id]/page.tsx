'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight, Radio, Clock, MapPin, BarChart3, LineChart as LineChartIcon,
  TrendingUp, Trophy, SearchX, Home,
} from 'lucide-react';
import type { Market, MarketSelection } from '@/lib/types';
import { db } from '@/lib/mock/db';
import { SPORTS } from '@/lib/mock/catalog';
import { TeamLogo } from '@/components/sportsbook/TeamLogo';
import { OddsButton } from '@/components/sportsbook/OddsButton';
import { BetSlipSidebar } from '@/components/sportsbook/BetSlip';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { AreaTrend } from '@/components/charts/Charts';
import { formatDateTime, formatCompact, cn } from '@/lib/utils';

// Deterministic 0..1 pseudo value seeded from a string + index.
function seeded(str: string, i: number) {
  let h = 2166136261;
  for (let c = 0; c < str.length; c++) h = (h ^ str.charCodeAt(c)) * 16777619;
  h = (h ^ (i * 2654435761)) >>> 0;
  return (h % 1000) / 1000;
}

const MARKET_TABS = [
  { value: 'all', label: 'All' },
  { value: 'moneyline', label: 'Moneyline' },
  { value: 'spread', label: 'Spread' },
  { value: 'total', label: 'Total' },
  { value: 'props', label: 'Player Props' },
  { value: 'futures', label: 'Futures' },
];

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const event = db().events.find((e) => e.id === id);
  const [tab, setTab] = useState('all');

  const oddsSeries = useMemo(() => {
    if (!event) return [];
    const base = Math.abs(event.markets[0].selections[0].odds);
    return Array.from({ length: 14 }, (_, i) => ({
      t: `-${(14 - i) * 5}m`,
      price: Math.round(base + (seeded(event.id, i) - 0.5) * 60),
    }));
  }, [event]);

  const matchStats = useMemo(() => {
    if (!event) return [];
    const rows = ['Possession %', 'Shots', 'Shots on target', 'Corners', 'Fouls', 'Momentum'];
    return rows.map((label, i) => {
      const a = 30 + Math.round(seeded(event.id, i * 3 + 1) * 45);
      const b = 30 + Math.round(seeded(event.id, i * 3 + 2) * 45);
      return { label, away: a, home: b };
    });
  }, [event]);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={SearchX}
          title="Event not found"
          description="This match may have finished or the link is out of date. Browse our live and upcoming markets instead."
          action={
            <Link href="/sports">
              <Button>Back to sportsbook</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const icon = SPORTS.find((s) => s.key === event.sport)?.icon;
  const isLive = event.status === 'live';
  const hasScore = isLive || event.status === 'finished';
  const markets = tab === 'all' ? event.markets : event.markets.filter((m) => m.key === tab);

  const sel = (mkt: Market, s: MarketSelection) => ({
    id: `${event.id}:${s.id}`,
    eventId: event.id,
    eventLabel: `${event.away.short} @ ${event.home.short}`,
    marketName: mkt.name,
    selectionLabel: s.label,
    odds: s.odds,
  });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/sports" className="hover:text-foreground">
          Sportsbook
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/sports?sport=${event.sport}`} className="hover:text-foreground">
          {event.sport}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-secondary">
          {event.away.short} @ {event.home.short}
        </span>
      </nav>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Match overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-lg border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-secondary">
                <span>{icon}</span>
                <span className="font-medium text-foreground">{event.sport}</span>
                <span className="text-muted">· {event.league}</span>
              </span>
              {isLive ? (
                <Badge variant="live">
                  <Radio className="h-3 w-3 animate-pulse-live" /> LIVE · {event.clock}
                </Badge>
              ) : event.status === 'finished' ? (
                <Badge variant="default">
                  <Trophy className="h-3 w-3" /> Final
                </Badge>
              ) : (
                <span className="flex items-center gap-1 text-muted">
                  <Clock className="h-3 w-3" /> {formatDateTime(event.startTime)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <TeamBlock name={event.away.name} record={event.away.record} logo={event.away} align="right" />
              <div className="flex flex-col items-center">
                {hasScore ? (
                  <div className="flex items-center gap-3 text-4xl font-extrabold tabular-nums">
                    <span>{event.scoreAway}</span>
                    <span className="text-muted">·</span>
                    <span>{event.scoreHome}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-muted">VS</span>
                )}
                {isLive && (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="mt-2 rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-bold text-danger"
                  >
                    {event.clock}
                  </motion.span>
                )}
              </div>
              <TeamBlock name={event.home.name} record={event.home.record} logo={event.home} align="left" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-secondary">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted" /> {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted" /> {formatDateTime(event.startTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-muted" /> {formatCompact(event.betCount)} bets placed
              </span>
            </div>
          </motion.div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickStat label="Away record" value={event.away.record ?? '—'} />
            <QuickStat label="Home record" value={event.home.record ?? '—'} />
            <QuickStat label="Markets" value={String(event.markets.length)} />
            <QuickStat label="Handle" value={formatCompact(event.betCount)} />
          </div>

          {/* Market tabs */}
          <Tabs tabs={MARKET_TABS} value={tab} onChange={setTab} />

          {/* Markets */}
          <div className="space-y-4">
            {markets.map((mkt, mi) => (
              <motion.div
                key={mkt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(mi * 0.05, 0.25) }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{mkt.name}</h3>
                  <span className="text-[11px] uppercase tracking-wide text-muted">{mkt.selections.length} options</span>
                </div>
                <div
                  className={cn(
                    'grid gap-2',
                    mkt.selections.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                  )}
                >
                  {mkt.selections.map((s) => (
                    <div key={s.id} className="flex flex-col gap-1">
                      <span className="truncate px-1 text-[11px] text-secondary">{s.label}</span>
                      <OddsButton selection={sel(mkt, s)} trend={s.trend} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Odds movement + Match statistics */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <LineChartIcon className="h-4 w-4 text-primary" /> Odds movement
                </h3>
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3.5 w-3.5" /> {event.away.short} ML
                </span>
              </div>
              <AreaTrend data={oddsSeries} x="t" y="price" height={200} format={(v) => `${v}`} />
              <p className="mt-2 text-center text-[11px] text-muted">Line history · last 70 minutes</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-info" /> Match statistics
              </h3>
              <div className="mb-3 flex items-center justify-between text-xs font-semibold">
                <span style={{ color: event.away.color }}>{event.away.short}</span>
                <span className="text-muted">STAT</span>
                <span style={{ color: event.home.color }}>{event.home.short}</span>
              </div>
              <div className="space-y-3">
                {matchStats.map((row) => {
                  const total = row.away + row.home || 1;
                  const awayPct = (row.away / total) * 100;
                  return (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-bold tabular-nums">{row.away}</span>
                        <span className="text-muted">{row.label}</span>
                        <span className="font-bold tabular-nums">{row.home}</span>
                      </div>
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div style={{ width: `${awayPct}%`, background: event.away.color }} />
                        <div style={{ width: `${100 - awayPct}%`, background: event.home.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted">
            Odds subject to change. 21+. Please gamble responsibly. Problem gambling? Call 1-800-GAMBLER.
          </p>
        </div>

        <BetSlipSidebar />
      </div>
    </div>
  );
}

function TeamBlock({
  name,
  record,
  logo,
  align,
}: {
  name: string;
  record?: string;
  logo: { name: string; short: string; logo: string; color: string };
  align: 'left' | 'right';
}) {
  return (
    <div className={cn('flex items-center gap-3', align === 'right' ? 'flex-row-reverse text-right' : 'text-left')}>
      <TeamLogo team={logo} size={56} />
      <div className="min-w-0">
        <p className="truncate text-base font-bold leading-tight sm:text-lg">{name}</p>
        {record && <p className="text-xs text-muted tabular-nums">{record}</p>}
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
