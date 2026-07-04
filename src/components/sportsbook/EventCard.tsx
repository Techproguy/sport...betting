'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radio, Clock, BarChart3, ChevronRight } from 'lucide-react';
import type { SportEvent } from '@/lib/types';
import { TeamLogo } from './TeamLogo';
import { OddsButton } from './OddsButton';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCompact } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';

export function EventCard({ event, index = 0 }: { event: SportEvent; index?: number }) {
  const ml = event.markets.find((m) => m.key === 'moneyline')!;
  const sp = event.markets.find((m) => m.key === 'spread');
  const tot = event.markets.find((m) => m.key === 'total');
  const icon = SPORTS.find((s) => s.key === event.sport)?.icon;
  const isLive = event.status === 'live';

  const sel = (mktName: string, s: { id: string; label: string; odds: number }) => ({
    id: `${event.id}:${s.id}`,
    eventId: event.id,
    eventLabel: `${event.away.short} @ ${event.home.short}`,
    marketName: mktName,
    selectionLabel: s.label,
    odds: s.odds,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-secondary">
        <span className="flex items-center gap-1.5">
          <span>{icon}</span>
          <span className="font-medium">{event.sport}</span>
          <span className="text-muted">· {event.league}</span>
        </span>
        {isLive ? (
          <Badge variant="live">
            <Radio className="h-3 w-3 animate-pulse-live" /> LIVE {event.clock}
          </Badge>
        ) : (
          <span className="flex items-center gap-1 text-muted">
            <Clock className="h-3 w-3" /> {formatDateTime(event.startTime)}
          </span>
        )}
      </div>

      <Link href={`/event/${event.id}`} className="block space-y-2">
        {[
          { team: event.away, score: event.scoreAway },
          { team: event.home, score: event.scoreHome },
        ].map((row) => (
          <div key={row.team.short} className="flex items-center gap-3">
            <TeamLogo team={row.team} size={34} />
            <span className="flex-1 truncate text-sm font-semibold">{row.team.name}</span>
            {(isLive || event.status === 'finished') && (
              <span className="text-sm font-bold tabular-nums text-foreground">{row.score}</span>
            )}
          </div>
        ))}
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-center text-[10px] uppercase tracking-wide text-muted">Spread</span>
          {sp?.selections.map((s) => (
            <OddsButton key={s.id} compact selection={sel('Spread', s)} sub={s.label.replace(/^[A-Z]+ /, '')} trend={s.trend} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-center text-[10px] uppercase tracking-wide text-muted">Total</span>
          {tot?.selections.map((s) => (
            <OddsButton key={s.id} compact selection={sel('Total', s)} sub={s.label.split(' ')[0]} trend={s.trend} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-center text-[10px] uppercase tracking-wide text-muted">Money</span>
          {ml.selections.map((s) => (
            <OddsButton key={s.id} compact selection={sel('Moneyline', s)} sub={s.label} trend={s.trend} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" /> {formatCompact(event.betCount)} bets
        </span>
        <Link href={`/event/${event.id}`} className="flex items-center gap-0.5 font-medium text-primary hover:underline">
          All markets <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}
