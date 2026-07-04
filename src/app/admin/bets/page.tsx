'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Ticket, ShieldAlert, CheckCircle2, Trophy, ChevronLeft, ChevronRight, X,
  Ban, RotateCcw, Flag, ArrowUpRight,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatOdds, formatNumber, formatDateTime } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';
import type { Bet, BetStatus } from '@/lib/types';

const PAGE_SIZE = 15;

function BetDrawer({ bet, userName, onClose, onStatus }: {
  bet: Bet; userName: string; onClose: () => void; onStatus: (id: string, s: BetStatus) => void;
}) {
  const timeline = [
    { label: 'Bet placed', time: bet.placedAt },
    ...(bet.settledAt ? [{ label: `Bet ${bet.status}`, time: bet.settledAt }] : [{ label: 'Awaiting settlement', time: bet.placedAt }]),
  ];
  const act = (label: string, s: BetStatus, kind: 'ok' | 'warn' | 'err') => {
    onStatus(bet.id, s);
    (kind === 'err' ? toast.error : kind === 'warn' ? toast.warning : toast.success)(label, bet.id);
    onClose();
  };

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
          <div>
            <p className="text-sm font-semibold">{bet.id}</p>
            <p className="text-xs text-muted capitalize">{bet.type} · {bet.sport}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <StatusPill status={bet.status} />
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info('Open user', userName)}>
              <Avatar name={userName} className="h-5 w-5 text-[9px]" />{userName}<ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['Stake', formatCurrency(bet.stake)],
              ['Odds', formatOdds(bet.combinedOdds)],
              ['Payout', formatCurrency(bet.potentialPayout)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className="text-[11px] text-muted">{l}</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>

          {/* Legs */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Selections ({bet.legs.length})</p>
            <div className="space-y-2">
              {bet.legs.map((leg, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{leg.selectionLabel}</p>
                    <span className="text-sm font-semibold tabular-nums text-primary">{formatOdds(leg.odds)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <span>{leg.eventLabel} · {leg.marketName}</span>
                    {leg.result && <StatusPill status={leg.result} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Timeline</p>
            <div className="space-y-3 border-l border-border pl-4">
              {timeline.map((t, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-surface" />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted">{formatDateTime(t.time)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
          <Button variant="primary" size="sm" onClick={() => act('Bet settled — Won', 'won', 'ok')}><CheckCircle2 className="h-4 w-4" />Settle Won</Button>
          <Button variant="secondary" size="sm" onClick={() => act('Bet settled — Lost', 'lost', 'warn')}><Ban className="h-4 w-4" />Settle Lost</Button>
          <Button variant="outline" size="sm" onClick={() => act('Bet voided', 'void', 'warn')}><X className="h-4 w-4" />Void Bet</Button>
          <Button variant="outline" size="sm" onClick={() => act('Bet refunded', 'void', 'ok')}><RotateCcw className="h-4 w-4" />Refund</Button>
          <Button variant="danger" size="sm" className="col-span-2" onClick={() => { toast.warning('Flagged for investigation', bet.id); onClose(); }}><Flag className="h-4 w-4" />Investigate</Button>
        </div>
      </motion.div>
    </>
  );
}

export default function AdminBetsPage() {
  const { bets: allBets, users } = db();
  const [bets, setBets] = useState<Bet[]>(() => allBets);
  const [sport, setSport] = useState('all');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Bet | null>(null);

  const userMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const u of users) m[u.id] = u.name;
    return m;
  }, [users]);

  const onStatus = (id: string, s: BetStatus) => setBets((prev) => prev.map((b) => (b.id === id ? { ...b, status: s } : b)));

  const filtered = useMemo(() => bets.filter((b) => {
    if (sport !== 'all' && b.sport !== sport) return false;
    if (status !== 'all' && b.status !== status) return false;
    if (type !== 'all' && b.type !== type) return false;
    return true;
  }), [bets, sport, status, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const openLiability = bets.filter((b) => b.status === 'pending').reduce((a, b) => a + (b.potentialPayout - b.stake), 0);
  const settledToday = bets.filter((b) => b.status !== 'pending').length;
  const biggestWin = bets.filter((b) => b.status === 'won').reduce((m, b) => Math.max(m, b.potentialPayout), 0);

  const columns: Column<Bet>[] = [
    { key: 'id', header: 'Bet ID', render: (b) => <span className="font-mono text-xs">{b.id}</span> },
    {
      key: 'user', header: 'User',
      render: (b) => (
        <div className="flex items-center gap-2">
          <Avatar name={userMap[b.userId] ?? '?'} className="h-7 w-7 text-[10px]" />
          <span className="truncate">{userMap[b.userId] ?? b.userId}</span>
        </div>
      ),
    },
    {
      key: 'selection', header: 'Selection',
      render: (b) => (
        <div className="max-w-[220px]">
          <p className="truncate text-sm font-medium">{b.legs[0]?.selectionLabel}</p>
          <p className="truncate text-xs text-muted">{b.legs[0]?.eventLabel}{b.type === 'parlay' && ` +${b.legs.length - 1} legs`}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (b) => <span className="capitalize text-secondary">{b.type}</span> },
    { key: 'stake', header: 'Stake', align: 'right', render: (b) => <span className="tabular-nums">{formatCurrency(b.stake)}</span> },
    { key: 'odds', header: 'Odds', align: 'right', render: (b) => <span className="tabular-nums text-primary">{formatOdds(b.combinedOdds)}</span> },
    { key: 'payout', header: 'Payout', align: 'right', render: (b) => <span className="font-semibold tabular-nums">{formatCurrency(b.potentialPayout)}</span> },
    { key: 'status', header: 'Status', render: (b) => <StatusPill status={b.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { onStatus(b.id, 'won'); toast.success('Bet settled — Won', b.id); }}><CheckCircle2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-warning" onClick={() => { onStatus(b.id, 'void'); toast.warning('Bet voided', b.id); }}><X className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => toast.warning('Flagged for investigation', b.id)}><Flag className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Bets">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Bets" value={formatNumber(bets.length)} icon={Ticket} sub="All time" />
        <StatCard label="Open Liability" value={formatCurrency(openLiability)} icon={ShieldAlert} accent="#FF4D4F" delta="+2.9%" />
        <StatCard label="Settled" value={formatNumber(settledToday)} icon={CheckCircle2} accent="#00D66F" sub="Resolved bets" />
        <StatCard label="Biggest Win" value={formatCurrency(biggestWin)} icon={Trophy} accent="#FFC107" sub="Single payout" />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card p-3">
        <Select value={sport} onChange={(e) => { setSport(e.target.value); setPage(0); }}>
          <option value="all">All sports</option>
          {SPORTS.map((s) => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="all">All status</option>
          {['pending', 'won', 'lost', 'void', 'cashout'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </Select>
        <Select value={type} onChange={(e) => { setType(e.target.value); setPage(0); }}>
          <option value="all">All types</option>
          <option value="single">Single</option>
          <option value="parlay">Parlay</option>
        </Select>
      </div>

      <DataTable columns={columns} rows={rows} onRowClick={setSelected} empty="No bets match your filters." />

      <div className="flex items-center justify-between text-xs text-muted">
        <span>Showing {rows.length} of {formatNumber(filtered.length)} bets</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="tabular-nums">Page {safePage + 1} / {pageCount}</span>
          <Button variant="secondary" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <AnimatePresence>
        {selected && <BetDrawer key={selected.id} bet={selected} userName={userMap[selected.userId] ?? selected.userId} onClose={() => setSelected(null)} onStatus={onStatus} />}
      </AnimatePresence>
    </AdminPage>
  );
}
