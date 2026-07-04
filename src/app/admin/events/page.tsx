'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Radio, PauseCircle, Plus, ChevronLeft, ChevronRight, Scale, Eye } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatDateTime, formatCurrency, formatCompact, formatNumber } from '@/lib/utils';
import { SPORTS } from '@/lib/mock/catalog';
import type { SportEvent } from '@/lib/types';

const PAGE_SIZE = 15;

function seedFrom(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function handleFor(e: SportEvent) {
  return 4000 + (seedFrom(e.id) % 480000) + e.betCount * 3;
}
function icon(sport: string) {
  return SPORTS.find((s) => s.key === sport)?.icon ?? '🎯';
}

export default function AdminEventsPage() {
  const { events } = db();
  const [sport, setSport] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => events.filter((e) => {
    if (sport !== 'all' && e.sport !== sport) return false;
    if (status !== 'all' && e.status !== status) return false;
    return true;
  }), [events, sport, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const liveNow = events.filter((e) => e.status === 'live').length;
  const suspended = events.filter((e) => e.status === 'suspended').length;

  const columns: Column<SportEvent>[] = [
    {
      key: 'event', header: 'Event',
      render: (e) => (
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon(e.sport)}</span>
          <div>
            <p className="font-medium">{e.away.short} @ {e.home.short}</p>
            <p className="text-xs text-muted">{e.venue}</p>
          </div>
        </div>
      ),
    },
    { key: 'league', header: 'League', render: (e) => <span className="text-secondary">{e.league}</span> },
    { key: 'start', header: 'Start', render: (e) => <span className="text-xs text-secondary">{formatDateTime(e.startTime)}</span> },
    {
      key: 'status', header: 'Status',
      render: (e) => e.status === 'live'
        ? <Badge variant="live"><span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-danger" />Live {e.clock}</Badge>
        : <StatusPill status={e.status} />,
    },
    { key: 'markets', header: 'Markets', align: 'right', render: (e) => <span className="tabular-nums">{e.markets.length}</span> },
    { key: 'betCount', header: 'Bets', align: 'right', render: (e) => <span className="tabular-nums text-secondary">{formatCompact(e.betCount)}</span> },
    { key: 'handle', header: 'Handle', align: 'right', render: (e) => <span className="font-semibold tabular-nums">{formatCurrency(handleFor(e))}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Event opened', `${e.away.short} @ ${e.home.short}`)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-warning" onClick={() => toast.warning('Markets suspended', `${e.away.short} @ ${e.home.short}`)}><PauseCircle className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => toast.success('Sent to settlement', `${e.away.short} @ ${e.home.short}`)}><Scale className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage
      title="Events"
      action={<Button size="sm" onClick={() => toast.success('Create event', 'Event builder opened.')}><Plus className="h-4 w-4" />Create event</Button>}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Events" value={formatNumber(events.length)} icon={CalendarDays} sub="All sports" />
        <StatCard label="Live Now" value={`${liveNow}`} icon={Radio} accent="#FF4D4F" sub="In-play" />
        <StatCard label="Suspended" value={`${suspended}`} icon={PauseCircle} accent="#FFC107" sub="Markets frozen" />
        <StatCard label="Total Handle" value={formatCurrency(events.reduce((a, e) => a + handleFor(e), 0))} icon={Scale} accent="#00D66F" delta="+7.2%" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row">
        <Select value={sport} onChange={(e) => { setSport(e.target.value); setPage(0); }} className="sm:w-48">
          <option value="all">All sports</option>
          {SPORTS.map((s) => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="sm:w-48">
          <option value="all">All status</option>
          <option value="live">Live</option>
          <option value="upcoming">Upcoming</option>
          <option value="finished">Finished</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>

      <DataTable columns={columns} rows={rows} empty="No events match your filters." />

      <div className="flex items-center justify-between text-xs text-muted">
        <span>Showing {rows.length} of {formatNumber(filtered.length)} events</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="tabular-nums">Page {safePage + 1} / {pageCount}</span>
          <Button variant="secondary" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </AdminPage>
  );
}
