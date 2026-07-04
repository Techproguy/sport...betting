'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Flame, Zap, Radio, CalendarClock, TrendingUp, LayoutGrid, SearchX } from 'lucide-react';
import { SPORTS } from '@/lib/mock/catalog';
import { db } from '@/lib/mock/db';
import { EventCard } from '@/components/sportsbook/EventCard';
import { BetSlipSidebar } from '@/components/sportsbook/BetSlip';
import { OddsButton } from '@/components/sportsbook/OddsButton';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { formatOdds, formatCompact, cn } from '@/lib/utils';

const PAGE_SIZE = 24;

const SUB_TABS = [
  { value: 'all', label: 'All', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'live', label: 'Live', icon: <Radio className="h-4 w-4" /> },
  { value: 'upcoming', label: 'Upcoming', icon: <CalendarClock className="h-4 w-4" /> },
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
];

function SportsBrowse() {
  const params = useSearchParams();
  const initialSport = params.get('sport') ?? 'all';

  const [sport, setSport] = useState(initialSport);
  const [sub, setSub] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const all = db().events;

  const filtered = useMemo(() => {
    let list = all;
    if (sport !== 'all') list = list.filter((e) => e.sport === sport);
    if (sub === 'live') list = list.filter((e) => e.status === 'live');
    else if (sub === 'upcoming') list = list.filter((e) => e.status === 'upcoming');
    else if (sub === 'trending') list = list.filter((e) => e.isTrending);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.home.name.toLowerCase().includes(q) ||
          e.away.name.toLowerCase().includes(q) ||
          e.home.short.toLowerCase().includes(q) ||
          e.away.short.toLowerCase().includes(q)
      );
    }
    return list;
  }, [all, sport, sub, query]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [sport, sub, query]);

  const shown = filtered.slice(0, visible);

  const boosted = useMemo(
    () =>
      all
        .filter((e) => e.status !== 'finished')
        .slice(0, 8)
        .map((e, i) => {
          const base = e.markets[0].selections[i % 2];
          const bump = 45 + (i % 3) * 25;
          const boostedOdds = base.odds > 0 ? base.odds + bump : Math.abs(base.odds) + bump;
          return {
            e,
            was: base.odds,
            selection: {
              id: `${e.id}:boost-${base.id}`,
              eventId: e.id,
              eventLabel: `${e.away.short} @ ${e.home.short}`,
              marketName: 'Boosted Odds',
              selectionLabel: `${base.label} (Boost)`,
              odds: boostedOdds,
            },
          };
        }),
    [all]
  );

  const liveCount = all.filter((e) => e.status === 'live').length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          {/* Heading */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sportsbook</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Browse all markets</h1>
              <p className="mt-1 text-sm text-secondary">
                {formatCompact(all.length)} matches across {SPORTS.length} sports · {liveCount} live now
              </p>
            </div>
            <Badge variant="live" className="h-fit">
              <Radio className="h-3 w-3 animate-pulse-live" /> {liveCount} Live
            </Badge>
          </div>

          {/* Boosted odds promo strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 overflow-hidden rounded-lg border border-warning/30 bg-gradient-to-r from-warning/10 to-transparent p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-warning">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-warning">Boosted odds</span>
              <span className="text-xs text-muted">Enhanced lines — today only</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {boosted.map((b) => (
                <div
                  key={b.selection.id}
                  className="flex w-56 flex-shrink-0 flex-col gap-2 rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-semibold text-foreground">
                      {b.e.away.short} @ {b.e.home.short}
                    </span>
                    <span className="text-muted">{SPORTS.find((s) => s.key === b.e.sport)?.icon}</span>
                  </div>
                  <p className="truncate text-xs text-secondary">{b.selection.selectionLabel.replace(' (Boost)', '')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted line-through tabular-nums">{formatOdds(b.was)}</span>
                    <div className="flex-1">
                      <OddsButton compact selection={b.selection} sub="Boost" trend="up" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams, players or matchups…"
              className="pl-10"
            />
          </div>

          {/* Sport chips */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSport('all')}
              className={cn(
                'flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                sport === 'all'
                  ? 'border-primary bg-primary/12 text-primary'
                  : 'border-border bg-card text-secondary hover:border-primary/50 hover:text-foreground'
              )}
            >
              <Flame className="h-4 w-4" /> All sports
            </button>
            {SPORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSport(s.key)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  sport === s.key
                    ? 'border-primary bg-primary/12 text-primary'
                    : 'border-border bg-card text-secondary hover:border-primary/50 hover:text-foreground'
                )}
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Sub filters */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Tabs tabs={SUB_TABS} value={sub} onChange={setSub} />
            <span className="text-xs text-muted">
              {formatCompact(filtered.length)} result{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
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
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matches found"
              description="Try a different sport, clear your search, or switch filters to see more markets."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setSport('all');
                    setSub('all');
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {shown.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more markets · {formatCompact(filtered.length - visible)} more
                  </Button>
                </div>
              )}
              <p className="mt-8 text-center text-xs text-muted">
                21+. Please gamble responsibly. Terms apply. Problem gambling? Call 1-800-GAMBLER.
              </p>
            </>
          )}
        </div>

        <BetSlipSidebar />
      </div>
    </div>
  );
}

export default function SportsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1600px] px-4 py-16 text-center text-secondary">Loading markets…</div>}>
      <SportsBrowse />
    </Suspense>
  );
}
