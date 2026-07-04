'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scale, Zap, Clock, Target, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatNumber, timeAgo, cn } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';
import type { SportEvent } from '@/lib/types';

interface QueueRow { event: SportEvent; openBets: number; exposure: number; }
interface SettledRow { id: string; label: string; sport: string; market: string; outcome: string; bets: number; payout: number; at: string; }

function icon(sport: string) { return SPORTS.find((s) => s.key === sport)?.icon ?? '🎯'; }

function SettlePanel({ row, onClose, onConfirm }: {
  row: QueueRow; onClose: () => void; onConfirm: (r: QueueRow, outcomes: Record<string, string>) => void;
}) {
  const markets = row.event.markets.filter((m) => ['moneyline', 'spread', 'total'].includes(m.key));
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const allSet = markets.every((m) => outcomes[m.id]);
  const payoutTotal = Math.round(row.exposure * 0.62);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{icon(row.event.sport)}</span>
            <div>
              <p className="text-sm font-semibold">{row.event.away.short} @ {row.event.home.short}</p>
              <p className="text-xs text-muted">{row.event.league}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted">Open Bets</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{formatNumber(row.openBets)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] text-muted">Exposure</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-danger">{formatCurrency(row.exposure)}</p>
            </div>
          </div>

          {row.event.scoreHome !== undefined && (
            <div className="flex items-center justify-center gap-4 rounded-lg border border-border bg-card py-3">
              <span className="text-sm font-medium">{row.event.away.short}</span>
              <span className="text-2xl font-bold tabular-nums">{row.event.scoreAway} – {row.event.scoreHome}</span>
              <span className="text-sm font-medium">{row.event.home.short}</span>
            </div>
          )}

          <div className="space-y-4">
            {markets.map((m) => (
              <div key={m.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{m.name} — winning outcome</p>
                <div className="grid grid-cols-1 gap-2">
                  {m.selections.map((s) => {
                    const active = outcomes[m.id] === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setOutcomes((p) => ({ ...p, [m.id]: s.id }))}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors',
                          active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-secondary hover:border-primary/40'
                        )}
                      >
                        <span className="font-medium">{s.label}</span>
                        {active && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Affected bets</span>
              <span className="font-semibold tabular-nums">{formatNumber(row.openBets)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-secondary">Estimated payout</span>
              <span className="font-bold tabular-nums text-primary">{formatCurrency(payoutTotal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <Button
            className="w-full" disabled={!allSet}
            onClick={() => { onConfirm(row, outcomes); toast.success('Settlement confirmed', `${row.openBets} bets settled · ${formatCurrency(payoutTotal)} paid.`); }}
          >
            <Scale className="h-4 w-4" />Confirm settlement
          </Button>
          {!allSet && <p className="mt-2 text-center text-[11px] text-muted">Select a winning outcome for every market.</p>}
        </div>
      </motion.div>
    </>
  );
}

export default function AdminSettlementPage() {
  const { events, bets } = db();

  const byEvent = useMemo(() => {
    const m: Record<string, { openBets: number; exposure: number }> = {};
    for (const b of bets) {
      if (b.status !== 'pending') continue;
      for (const leg of b.legs) {
        const e = (m[leg.eventId] ??= { openBets: 0, exposure: 0 });
        e.openBets += 1;
        e.exposure += b.potentialPayout;
      }
    }
    return m;
  }, [bets]);

  const initialQueue = useMemo<QueueRow[]>(() => events
    .filter((e) => (e.status === 'finished' || e.status === 'live') && byEvent[e.id])
    .map((e) => ({ event: e, openBets: byEvent[e.id].openBets, exposure: Math.round(byEvent[e.id].exposure) }))
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 12), [events, byEvent]);

  const [queue, setQueue] = useState<QueueRow[]>(initialQueue);
  const [settled, setSettled] = useState<SettledRow[]>(() =>
    events.filter((e) => e.status === 'finished').slice(0, 6).map((e, i) => ({
      id: `stl_${e.id}`,
      label: `${e.away.short} @ ${e.home.short}`,
      sport: e.sport,
      market: 'Moneyline',
      outcome: (e.scoreHome ?? 0) >= (e.scoreAway ?? 0) ? e.home.short : e.away.short,
      bets: (byEvent[e.id]?.openBets ?? 40 + i * 7),
      payout: Math.round((byEvent[e.id]?.exposure ?? 120000) * 0.6),
      at: e.startTime,
    }))
  );
  const [selected, setSelected] = useState<QueueRow | null>(null);

  const onConfirm = (r: QueueRow, outcomes: Record<string, string>) => {
    const ml = r.event.markets.find((m) => m.key === 'moneyline');
    const winnerId = ml ? outcomes[ml.id] : undefined;
    const winner = ml?.selections.find((s) => s.id === winnerId)?.label ?? r.event.home.short;
    setQueue((q) => q.filter((x) => x.event.id !== r.event.id));
    setSettled((s) => [{
      id: `stl_${r.event.id}`,
      label: `${r.event.away.short} @ ${r.event.home.short}`,
      sport: r.event.sport,
      market: 'Moneyline',
      outcome: winner,
      bets: r.openBets,
      payout: Math.round(r.exposure * 0.62),
      at: new Date().toISOString(),
    }, ...s]);
    setSelected(null);
  };

  const totalExposure = queue.reduce((a, r) => a + r.exposure, 0);

  const queueColumns: Column<QueueRow & { id: string }>[] = [
    {
      key: 'event', header: 'Event',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon(r.event.sport)}</span>
          <div>
            <p className="font-medium">{r.event.away.short} @ {r.event.home.short}</p>
            <p className="text-xs text-muted">{r.event.league}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (r) => <StatusPill status={r.event.status === 'live' ? 'pending' : 'open'} />,
    },
    { key: 'openBets', header: 'Open Bets', align: 'right', render: (r) => <span className="tabular-nums">{formatNumber(r.openBets)}</span> },
    { key: 'exposure', header: 'Exposure', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-danger">{formatCurrency(r.exposure)}</span> },
    {
      key: 'action', header: '', align: 'right',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <Button size="sm" onClick={() => setSelected(r)}><Scale className="h-4 w-4" />Settle</Button>
        </div>
      ),
    },
  ];

  const settledColumns: Column<SettledRow>[] = [
    {
      key: 'label', header: 'Event',
      render: (r) => <div className="flex items-center gap-2"><span>{icon(r.sport)}</span><span className="font-medium">{r.label}</span></div>,
    },
    { key: 'market', header: 'Market', render: (r) => <span className="text-secondary">{r.market}</span> },
    { key: 'outcome', header: 'Outcome', render: (r) => <span className="font-semibold text-primary">{r.outcome}</span> },
    { key: 'bets', header: 'Bets', align: 'right', render: (r) => <span className="tabular-nums">{formatNumber(r.bets)}</span> },
    { key: 'payout', header: 'Payout', align: 'right', render: (r) => <span className="font-semibold tabular-nums">{formatCurrency(r.payout)}</span> },
    { key: 'at', header: 'Settled', align: 'right', render: (r) => <span className="text-xs text-muted">{timeAgo(r.at)}</span> },
  ];

  return (
    <AdminPage title="Settlement">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Awaiting Settlement" value={`${queue.length}`} icon={Scale} accent="#FFC107" sub="Events in queue" />
        <StatCard label="Queue Exposure" value={formatCurrency(totalExposure)} icon={ShieldAlert} accent="#FF4D4F" sub="Open liability" />
        <StatCard label="Auto-Settled Today" value="1,284" icon={Zap} accent="#00D66F" delta="+11%" sub="94% of volume" />
        <StatCard label="Avg Settle Time" value="38s" icon={Clock} accent="#3B82F6" sub="Post-final whistle" />
      </div>

      {/* Auto-settlement banner */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary"><Target className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-semibold">Auto-settlement engine</p>
            <p className="text-xs text-muted">99.4% settlement accuracy · 6 markets flagged for manual review</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast.info('Engine settings', 'Auto-settlement configuration opened.')}>Configure</Button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Settlement Queue</h3>
        <DataTable columns={queueColumns} rows={queue.map((r) => ({ ...r, id: r.event.id }))} empty="Queue is clear — all events settled." />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Recently Settled</h3>
        <DataTable columns={settledColumns} rows={settled} empty="No recent settlements." />
      </div>

      <AnimatePresence>
        {selected && <SettlePanel key={selected.event.id} row={selected} onClose={() => setSelected(null)} onConfirm={onConfirm} />}
      </AnimatePresence>
    </AdminPage>
  );
}
