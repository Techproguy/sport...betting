'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radio, Trophy, CalendarDays, ClipboardList } from 'lucide-react';
import type { SportEvent } from '@/lib/types';
import { db } from '@/lib/mock/db';
import { SPORTS } from '@/lib/mock/catalog';
import { TeamLogo } from '@/components/sportsbook/TeamLogo';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { formatDate, cn } from '@/lib/utils';

export default function ResultsPage() {
  const [sport, setSport] = useState('all');

  const results = useMemo(() => {
    const finished = db().events.filter((e) => e.status === 'finished');
    const live = db().events.filter((e) => e.status === 'live');
    return [...finished, ...live].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, []);

  const tabs = useMemo(() => {
    const present = new Set(results.map((e) => e.sport));
    return [
      { value: 'all', label: 'All' },
      ...SPORTS.filter((s) => present.has(s.key)).map((s) => ({
        value: s.key,
        label: s.label,
        icon: <span className="text-sm">{s.icon}</span>,
      })),
    ];
  }, [results]);

  const filtered = sport === 'all' ? results : results.filter((e) => e.sport === sport);

  // Group by day (most recent first, preserving sorted order).
  const groups = useMemo(() => {
    const map = new Map<string, SportEvent[]>();
    for (const e of filtered) {
      const key = formatDate(e.startTime);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Scores & results</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Results</h1>
        <p className="mt-1 text-sm text-secondary">Final scores and settled markets across every sport.</p>
      </div>

      <div className="mb-6">
        <Tabs tabs={tabs} value={sport} onChange={setSport} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No results yet"
          description="There are no settled events for this sport right now. Check back after today's games wrap up."
        />
      ) : (
        <div className="space-y-8">
          {groups.map(([day, events]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted" />
                <h2 className="text-sm font-semibold text-secondary">{day}</h2>
                <span className="text-xs text-muted">· {events.length} events</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {events.map((e, i) => (
                  <ResultRow key={e.id} event={e} index={i} last={i === events.length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted">
        Settlement is final once markets are graded. 21+. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}

function ResultRow({ event, index, last }: { event: SportEvent; index: number; last: boolean }) {
  const isLive = event.status === 'live';
  const awayWon = (event.scoreAway ?? 0) > (event.scoreHome ?? 0);
  const homeWon = (event.scoreHome ?? 0) > (event.scoreAway ?? 0);
  const icon = SPORTS.find((s) => s.key === event.sport)?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
    >
      <Link
        href={`/event/${event.id}`}
        className={cn(
          'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-elevated/50',
          !last && 'border-b border-border'
        )}
      >
        <div className="hidden w-24 flex-shrink-0 items-center gap-1.5 text-xs text-muted sm:flex">
          <span>{icon}</span>
          <span className="font-medium">{event.sport}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <ResultTeam team={event.away} score={event.scoreAway} won={awayWon && !isLive} />
          <ResultTeam team={event.home} score={event.scoreHome} won={homeWon && !isLive} />
        </div>

        <div className="flex-shrink-0">
          {isLive ? (
            <Badge variant="live">
              <Radio className="h-3 w-3 animate-pulse-live" /> {event.clock}
            </Badge>
          ) : (
            <Badge variant="success">
              <Trophy className="h-3 w-3" /> Settled
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ResultTeam({
  team,
  score,
  won,
}: {
  team: { name: string; short: string; logo: string; color: string };
  score?: number;
  won: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <TeamLogo team={team} size={26} />
      <span className={cn('flex-1 truncate text-sm', won ? 'font-bold text-foreground' : 'text-secondary')}>
        {team.name}
      </span>
      {won && <Trophy className="h-3.5 w-3.5 text-warning" />}
      <span className={cn('w-8 text-right text-sm tabular-nums', won ? 'font-bold text-foreground' : 'text-secondary')}>
        {score ?? '—'}
      </span>
    </div>
  );
}
