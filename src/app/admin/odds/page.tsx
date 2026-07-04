'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, TrendingUp, Activity } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { AreaTrend } from '@/components/charts/Charts';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { cn, formatOdds, impliedProbability } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';
import type { SportEvent, SportKey } from '@/lib/types';

interface OddsRow { mlH: number; mlA: number; spread: number; total: number; }

function seedFrom(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function initRow(e: SportEvent): OddsRow {
  const ml = e.markets.find((m) => m.key === 'moneyline');
  const sp = e.markets.find((m) => m.key === 'spread');
  const tot = e.markets.find((m) => m.key === 'total');
  return {
    mlH: ml?.selections[0].odds ?? -110,
    mlA: ml?.selections[1].odds ?? +110,
    spread: sp?.selections[0].odds ?? -110,
    total: tot?.selections[0].odds ?? -110,
  };
}
function overround(row: OddsRow) {
  return (impliedProbability(row.mlH) + impliedProbability(row.mlA) - 1) * 100;
}
function movementSeries(e: SportEvent, base: number) {
  const s = seedFrom(e.id);
  return Array.from({ length: 14 }, (_, i) => {
    const wobble = (((s >> (i % 12)) & 0xff) / 255 - 0.5) * 40;
    return { t: `${-((13 - i) * 5)}m`, odds: Math.round(base + wobble - (7 - i) * 2) };
  });
}

export default function AdminOddsPage() {
  const { events } = db();
  const [sport, setSport] = useState<SportKey>('NFL');
  const [values, setValues] = useState<Record<string, OddsRow>>({});
  const [flash, setFlash] = useState<string>('');
  const [trendId, setTrendId] = useState<string>('');

  const countBySport = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) m[e.sport] = (m[e.sport] ?? 0) + 1;
    return m;
  }, [events]);

  const sportEvents = useMemo(
    () => events.filter((e) => e.sport === sport && (e.status === 'live' || e.status === 'upcoming')).slice(0, 10),
    [events, sport]
  );

  const rowFor = (e: SportEvent): OddsRow => values[e.id] ?? initRow(e);
  const trendEvent = sportEvents.find((e) => e.id === trendId) ?? sportEvents[0];

  const update = (e: SportEvent, key: keyof OddsRow, raw: string) => {
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    setValues((prev) => ({ ...prev, [e.id]: { ...rowFor(e), [key]: num } }));
    const fid = `${e.id}:${key}`;
    setFlash(fid);
    setTimeout(() => setFlash((f) => (f === fid ? '' : f)), 700);
    toast.success('Odds updated', `${e.away.short} @ ${e.home.short}`);
  };

  const oddsInput = (e: SportEvent, key: keyof OddsRow) => {
    const fid = `${e.id}:${key}`;
    return (
      <input
        type="number"
        value={rowFor(e)[key]}
        onChange={(ev) => update(e, key, ev.target.value)}
        className={cn(
          'h-9 w-20 rounded-md border bg-surface px-2 text-right text-sm tabular-nums outline-none transition-all focus:border-primary',
          flash === fid ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : 'border-border'
        )}
      />
    );
  };

  return (
    <AdminPage title="Sports & Odds">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Sports list */}
        <div className="rounded-lg border border-border bg-card p-2">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Sports</p>
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SPORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setSport(s.key); setTrendId(''); }}
                className={cn(
                  'flex flex-shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:w-full',
                  sport === s.key ? 'bg-primary/12 text-primary' : 'text-secondary hover:bg-elevated hover:text-foreground'
                )}
              >
                <span className="text-base">{s.icon}</span>
                <span className="flex-1 text-left">{s.label}</span>
                <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[10px] tabular-nums text-muted">{countBySport[s.key] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Odds editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">{SPORTS.find((s) => s.key === sport)?.label} Odds</h3>
              <p className="text-xs text-muted">{sportEvents.length} open events · click a row to inspect movement</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => toast.warning('All markets suspended', `${sportEvents.length} ${sport} events frozen.`)}>
              <Ban className="h-4 w-4" />Suspend all
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-[11px] uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 text-left font-semibold">Event</th>
                    <th className="px-4 py-3 text-right font-semibold">ML Home</th>
                    <th className="px-4 py-3 text-right font-semibold">ML Away</th>
                    <th className="px-4 py-3 text-right font-semibold">Spread</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-right font-semibold">Overround</th>
                  </tr>
                </thead>
                <tbody>
                  {sportEvents.map((e) => {
                    const or = overround(rowFor(e));
                    const orColor = or > 8 ? 'text-danger' : or > 5 ? 'text-warning' : 'text-success';
                    return (
                      <tr
                        key={e.id}
                        onClick={() => setTrendId(e.id)}
                        className={cn(
                          'cursor-pointer border-b border-border/60 transition-colors hover:bg-elevated/40',
                          trendEvent?.id === e.id && 'bg-primary/5'
                        )}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{e.away.short} @ {e.home.short}</p>
                          <p className="text-xs text-muted">{e.status === 'live' ? `Live · ${e.clock}` : 'Upcoming'}</p>
                        </td>
                        <td className="px-4 py-2 text-right" onClick={(ev) => ev.stopPropagation()}>{oddsInput(e, 'mlH')}</td>
                        <td className="px-4 py-2 text-right" onClick={(ev) => ev.stopPropagation()}>{oddsInput(e, 'mlA')}</td>
                        <td className="px-4 py-2 text-right" onClick={(ev) => ev.stopPropagation()}>{oddsInput(e, 'spread')}</td>
                        <td className="px-4 py-2 text-right" onClick={(ev) => ev.stopPropagation()}>{oddsInput(e, 'total')}</td>
                        <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', orColor)}>{or.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Odds movement */}
          {trendEvent && (
            <motion.div
              key={trendEvent.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" />Odds Movement</h3>
                  <p className="text-xs text-muted">{trendEvent.away.short} @ {trendEvent.home.short} · Moneyline (Home) · last 70 min</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary"><TrendingUp className="h-3.5 w-3.5" />{formatOdds(rowFor(trendEvent).mlH)}</span>
              </div>
              <AreaTrend
                data={movementSeries(trendEvent, rowFor(trendEvent).mlH)}
                x="t" y="odds" color="#00D66F" height={200}
                format={(v) => formatOdds(Math.round(v))}
              />
            </motion.div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
