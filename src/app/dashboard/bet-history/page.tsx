'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Download, Target, Scale, CheckCircle2 } from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, Label } from '@/components/ui/input';
import { toast } from '@/store/toast';
import { formatCurrency, formatOdds, formatDate, cn } from '@/lib/utils';
import type { Bet } from '@/lib/types';

type Row = {
  id: string;
  date: string;
  type: Bet['type'];
  legs: Bet['legs'];
  stake: number;
  combinedOdds: number;
  payout: number;
  status: Bet['status'];
  sport: string;
};

function selectionSummary(row: Row) {
  if (row.type === 'single') return row.legs[0]?.selectionLabel ?? 'Selection';
  const first = row.legs[0]?.selectionLabel ?? 'Leg';
  return `${first} +${row.legs.length - 1} more`;
}

const PAGE_SIZE = 8;

export default function BetHistoryPage() {
  const user = currentUser();
  const settled = React.useMemo<Row[]>(
    () =>
      db()
        .bets.filter((b) => b.userId === user.id && b.status !== 'pending')
        .map((b) => ({
          id: b.id,
          date: b.settledAt ?? b.placedAt,
          type: b.type,
          legs: b.legs,
          stake: b.stake,
          combinedOdds: b.combinedOdds,
          payout: b.potentialPayout,
          status: b.status,
          sport: b.sport,
        })),
    [user.id]
  );

  const sports = React.useMemo(() => Array.from(new Set(settled.map((r) => r.sport))).sort(), [settled]);

  const [sport, setSport] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [sort, setSort] = React.useState('newest');
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  const wonBets = settled.filter((r) => r.status === 'won');
  const lostBets = settled.filter((r) => r.status === 'lost');
  const decided = wonBets.length + lostBets.length;
  const winRate = decided ? (wonBets.length / decided) * 100 : 0;
  const netPl = wonBets.reduce((s, r) => s + r.payout, 0) - lostBets.reduce((s, r) => s + r.stake, 0);

  const rows = React.useMemo(() => {
    let out = settled.filter(
      (r) => (sport === 'all' || r.sport === sport) && (status === 'all' || r.status === status)
    );
    out = [...out].sort((a, b) => {
      if (sort === 'stake') return b.stake - a.stake;
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === 'oldest' ? diff : -diff;
    });
    return out;
  }, [settled, sport, status, sort]);

  React.useEffect(() => setVisible(PAGE_SIZE), [sport, status, sort]);

  const paged = rows.slice(0, visible);

  const columns: Column<Row>[] = [
    { key: 'id', header: 'Bet ID', render: (r) => <span className="font-mono text-xs text-secondary">{r.id}</span> },
    { key: 'date', header: 'Date', render: (r) => <span className="text-secondary">{formatDate(r.date)}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (r) => <Badge variant={r.type === 'parlay' ? 'info' : 'default'}>{r.type}</Badge>,
    },
    { key: 'selection', header: 'Selection(s)', render: (r) => <span className="text-foreground">{selectionSummary(r)}</span> },
    { key: 'stake', header: 'Stake', align: 'right', className: 'tabular-nums', render: (r) => formatCurrency(r.stake) },
    { key: 'odds', header: 'Odds', align: 'right', className: 'tabular-nums text-secondary', render: (r) => formatOdds(r.combinedOdds) },
    {
      key: 'payout',
      header: 'Payout',
      align: 'right',
      className: 'tabular-nums font-semibold',
      render: (r) => (
        <span className={cn(r.status === 'won' ? 'text-success' : r.status === 'lost' ? 'text-danger' : 'text-secondary')}>
          {r.status === 'won' ? formatCurrency(r.payout) : r.status === 'lost' ? `-${formatCurrency(r.stake)}` : formatCurrency(r.stake)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bet History</h1>
          <p className="mt-1 text-sm text-secondary">Every settled ticket, filterable and export-ready.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Export started', 'Your CSV will be emailed to you shortly.')}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} icon={Target} accent="#22D3EE" sub={`${wonBets.length}/${decided} settled`} />
        <StatCard
          label="Net P / L"
          value={`${netPl >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netPl))}`}
          icon={Scale}
          accent={netPl >= 0 ? '#00D66F' : '#FF4D4F'}
          sub="Returns minus losses"
        />
        <StatCard label="Settled Bets" value={String(settled.length)} icon={CheckCircle2} accent="#3B82F6" sub="Lifetime resolved" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sport-filter">Sport</Label>
            <Select id="sport-filter" value={sport} onChange={(e) => setSport(e.target.value)}>
              <option value="all">All sports</option>
              {sports.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status-filter">Status</Label>
            <Select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="void">Void</option>
              <option value="cashout">Cashout</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sort-by">Sort by</Label>
            <Select id="sort-by" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="stake">Highest stake</option>
            </Select>
          </div>
        </div>

        <DataTable columns={columns} rows={paged} empty="No settled bets match these filters." />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Showing {paged.length} of {rows.length} bets
          </p>
          {visible < rows.length && (
            <Button variant="secondary" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Load more
            </Button>
          )}
        </div>
      </motion.div>

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
