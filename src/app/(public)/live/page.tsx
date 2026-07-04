'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Radio, Activity, Zap, Timer, BarChart3, Flame, Tv } from 'lucide-react';
import { SPORTS } from '@/lib/mock/catalog';
import { db } from '@/lib/mock/db';
import { EventCard } from '@/components/sportsbook/EventCard';
import { BetSlipSidebar } from '@/components/sportsbook/BetSlip';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/misc';
import { formatCompact } from '@/lib/utils';

export default function LivePage() {
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  // Auto-updating "pulse" so the page feels alive (drives the ping animation only).
  useEffect(() => {
    const id = setInterval(() => setTick((n) => (n + 1) % 1000), 3000);
    return () => clearInterval(id);
  }, []);

  const live = db().events.filter((e) => e.status === 'live');
  const scoreboard = live.slice(0, 14);

  const totalMarkets = useMemo(() => live.reduce((sum, e) => sum + e.markets.length, 0), [live]);
  const totalBets = useMemo(() => live.reduce((sum, e) => sum + e.betCount, 0), [live]);

  return (
    <div>
      {/* Live header banner */}
      <div className="border-b border-danger/20 bg-gradient-to-b from-danger/10 to-transparent">
        <div className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-danger">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
                </span>
                In-play now
              </span>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">Live betting</h1>
              <p className="mt-1 text-sm text-secondary">
                Odds updating in real time across every in-play market.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatChip icon={Radio} label="Live events" value={formatCompact(live.length)} accent="#FF4D4F" />
              <StatChip icon={BarChart3} label="Open markets" value={formatCompact(totalMarkets)} accent="#3B82F6" />
              <StatChip icon={Flame} label="Active bets" value={formatCompact(totalBets)} accent="#00D66F" />
            </div>
          </div>
        </div>
      </div>

      {/* Live scoreboard strip */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3">
          <span className="flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase text-danger">
            <Tv className="h-3.5 w-3.5" /> Scores
          </span>
          <div className="flex gap-3 overflow-x-auto no-scrollbar" key={tick}>
            {scoreboard.map((e) => (
              <Link
                key={e.id}
                href={`/event/${e.id}`}
                className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:border-danger/40"
              >
                <span className="text-sm">{SPORTS.find((s) => s.key === e.sport)?.icon}</span>
                <div className="whitespace-nowrap text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>{e.away.short}</span>
                    <span className="tabular-nums text-foreground">{e.scoreAway}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span>{e.home.short}</span>
                    <span className="tabular-nums text-foreground">{e.scoreHome}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                  <Timer className="h-3 w-3" /> {e.clock}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Activity className="h-5 w-5 text-danger" /> All live markets
              </h2>
              <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                <Zap className="h-3.5 w-3.5 text-warning" /> Cash out available
              </span>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="mb-2 h-9 w-full" />
                    <Skeleton className="mb-4 h-9 w-full" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : live.length === 0 ? (
              <EmptyState
                icon={Radio}
                title="No live events right now"
                description="Check back soon — in-play markets open as games kick off throughout the day."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {live.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} />
                ))}
              </div>
            )}

            <p className="mt-8 text-center text-xs text-muted">
              Live odds fluctuate rapidly. 21+. Gambling problem? Call 1-800-GAMBLER.
            </p>
          </div>

          <BetSlipSidebar />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Radio;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-[11px] text-muted">{label}</p>
      </div>
    </div>
  );
}
