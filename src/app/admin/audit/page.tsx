'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  ShieldCheck,
  Activity,
  Users,
  AlertTriangle,
  Lock,
  X,
  ArrowRight,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatCard } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { toast } from '@/store/toast';
import { db } from '@/lib/mock/db';
import type { AuditLog } from '@/lib/types';
import { formatDateTime, initials } from '@/lib/utils';

// Deterministic hash — no Math.random at render time.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari',
];

// Extra synthesized deterministic rows (ids aud_9001..) merged with db().audit.
const SYNTHETIC: AuditLog[] = [
  {
    id: 'aud_9001',
    actor: 'Priya Nair',
    action: 'Adjusted odds',
    target: 'evt_0031',
    timestamp: '2026-07-04T13:42:00.000Z',
    ip: '72.14.201.19',
  },
  {
    id: 'aud_9002',
    actor: 'Marcus Bell',
    action: 'Suspended user',
    target: 'usr_0088',
    timestamp: '2026-07-04T11:05:00.000Z',
    ip: '198.51.100.42',
  },
  {
    id: 'aud_9003',
    actor: 'Dana Whitfield',
    action: 'Approved withdrawal',
    target: 'txn_00741',
    timestamp: '2026-07-04T09:18:00.000Z',
    ip: '203.0.113.77',
  },
  {
    id: 'aud_9004',
    actor: 'Priya Nair',
    action: 'Voided bet',
    target: 'bet_00512',
    timestamp: '2026-07-03T22:47:00.000Z',
    ip: '45.33.128.9',
  },
  {
    id: 'aud_9005',
    actor: 'Leo Castellano',
    action: 'Changed risk limit',
    target: 'evt_0007',
    timestamp: '2026-07-03T18:02:00.000Z',
    ip: '104.28.16.201',
  },
  {
    id: 'aud_9006',
    actor: 'Dana Whitfield',
    action: 'Exported report',
    target: 'rpt_2026Q2',
    timestamp: '2026-07-03T15:30:00.000Z',
    ip: '188.114.97.3',
  },
];

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

function actionCategory(action: string): { label: string; variant: BadgeVariant } {
  const a = action.toLowerCase();
  if (a.includes('approve')) return { label: 'Approval', variant: 'success' };
  if (a.includes('suspend') || a.includes('void')) return { label: 'Enforcement', variant: 'danger' };
  if (a.includes('flag')) return { label: 'Risk', variant: 'warning' };
  if (a.includes('updated') || a.includes('changed') || a.includes('adjust'))
    return { label: 'Change', variant: 'info' };
  if (a.includes('export')) return { label: 'Export', variant: 'default' };
  if (a.includes('settle')) return { label: 'Settlement', variant: 'primary' };
  return { label: 'System', variant: 'default' };
}

// Deterministic before/after change diff by action.
function changeDiff(action: string): { field: string; before: string; after: string }[] {
  const a = action.toLowerCase();
  if (a.includes('adjust'))
    return [
      { field: 'odds', before: '-110', after: '-125' },
      { field: 'line', before: '2.5', after: '3.5' },
      { field: 'margin', before: '4.6%', after: '5.2%' },
    ];
  if (a.includes('suspend'))
    return [
      { field: 'status', before: '"active"', after: '"suspended"' },
      { field: 'withdrawalsLocked', before: 'false', after: 'true' },
      { field: 'reason', before: 'null', after: '"AML review"' },
    ];
  if (a.includes('void'))
    return [
      { field: 'status', before: '"settled"', after: '"void"' },
      { field: 'payout', before: '412.50', after: '0.00' },
      { field: 'stakeRefunded', before: 'false', after: 'true' },
    ];
  if (a.includes('approve') && a.includes('kyc'))
    return [
      { field: 'kycStatus', before: '"pending"', after: '"approved"' },
      { field: 'tier', before: '"unverified"', after: '"verified"' },
    ];
  if (a.includes('approve') && a.includes('withdraw'))
    return [
      { field: 'status', before: '"processing"', after: '"completed"' },
      { field: 'approvedBy', before: 'null', after: '"admin"' },
    ];
  if (a.includes('changed') && a.includes('risk'))
    return [
      { field: 'maxLiability', before: '250000', after: '180000' },
      { field: 'autoLimit', before: 'false', after: 'true' },
    ];
  if (a.includes('updated'))
    return [
      { field: 'value', before: '"$100 bonus"', after: '"$150 bonus"' },
      { field: 'active', before: 'false', after: 'true' },
    ];
  if (a.includes('flag'))
    return [
      { field: 'riskScore', before: '48', after: '86' },
      { field: 'status', before: '"open"', after: '"escalated"' },
    ];
  if (a.includes('settle'))
    return [
      { field: 'status', before: '"open"', after: '"settled"' },
      { field: 'result', before: 'null', after: '"home"' },
    ];
  if (a.includes('export'))
    return [
      { field: 'artifact', before: 'null', after: '"report.csv"' },
      { field: 'rows', before: '0', after: '12480' },
    ];
  return [{ field: 'updatedAt', before: '"—"', after: '"' + new Date().toISOString().slice(0, 10) + '"' }];
}

export default function AuditLogsPage() {
  const rows = React.useMemo<AuditLog[]>(() => {
    const merged = [...db().audit, ...SYNTHETIC];
    return merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, []);

  const actors = React.useMemo(() => Array.from(new Set(rows.map((r) => r.actor))).sort(), [rows]);
  const actions = React.useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);

  const [query, setQuery] = React.useState('');
  const [actorFilter, setActorFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');
  const [selected, setSelected] = React.useState<AuditLog | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (actorFilter !== 'all' && r.actor !== actorFilter) return false;
      if (actionFilter !== 'all' && r.action !== actionFilter) return false;
      if (!q) return true;
      return (
        r.actor.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q)
      );
    });
  }, [rows, query, actorFilter, actionFilter]);

  // Deterministic "actions today" subset (2026-07-04) + criticals.
  const stats = React.useMemo(() => {
    const today = rows.filter((r) => r.timestamp.slice(0, 10) === '2026-07-04').length;
    const critical = rows.filter((r) => {
      const v = actionCategory(r.action).variant;
      return v === 'danger' || v === 'warning';
    }).length;
    return {
      total: rows.length,
      today,
      actors: new Set(rows.map((r) => r.actor)).size,
      critical,
    };
  }, [rows]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (r) => (
        <span className="whitespace-nowrap font-mono text-xs tabular-nums text-secondary">
          {formatDateTime(r.timestamp)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.actor} className="h-7 w-7 shrink-0" />
          <span className="whitespace-nowrap font-medium text-foreground">{r.actor}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => {
        const cat = actionCategory(r.action);
        return (
          <div className="flex items-center gap-2">
            <Badge variant={cat.variant}>{cat.label}</Badge>
            <span className="whitespace-nowrap text-secondary">{r.action}</span>
          </div>
        );
      },
    },
    {
      key: 'target',
      header: 'Target',
      render: (r) => (
        <span className="rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-xs text-foreground/90">
          {r.target}
        </span>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      align: 'right',
      render: (r) => <span className="font-mono text-xs tabular-nums text-muted">{r.ip}</span>,
    },
  ];

  return (
    <AdminPage
      title="Audit Logs"
      action={
        <Button onClick={() => toast.success('Audit log exported')}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total events"
            value={String(stats.total)}
            icon={Activity}
            accent="#00D66F"
            sub="Immutable ledger entries"
          />
          <StatCard
            label="Actions today"
            value={String(stats.today)}
            icon={ShieldCheck}
            accent="#3B82F6"
            sub="Since 00:00 UTC"
          />
          <StatCard
            label="Distinct actors"
            value={String(stats.actors)}
            icon={Users}
            accent="#A855F7"
            sub="Admins with activity"
          />
          <StatCard
            label="Critical actions"
            value={String(stats.critical)}
            icon={AlertTriangle}
            accent="#FF4D4F"
            sub="Enforcement & risk events"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action, or target…"
              className="pl-9"
            />
          </div>
          <Select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="sm:w-52"
          >
            <option value="all">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>

        {/* Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Event trail</h3>
            <span className="text-xs text-muted">
              {filtered.length} of {rows.length} events
            </span>
          </div>
          <DataTable<AuditLog>
            columns={columns}
            rows={filtered}
            onRowClick={(r) => setSelected(r)}
            empty="No audit events match your filters."
          />
        </div>

        {/* Compliance note */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-secondary">Immutable ledger.</span> Audit records are
            append-only and cryptographically chained; entries cannot be edited or deleted. Retained
            for 7 years to satisfy AML/KYC and state gaming-commission compliance requirements.
          </p>
        </div>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <DetailDrawer log={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </AdminPage>
  );
}

function DetailDrawer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const h = hash(log.id);
  const ua = UA_POOL[h % UA_POOL.length];
  const session = `sess_${(h % 0xffffff).toString(16).padStart(6, '0')}${(hash(log.actor) % 0xfff)
    .toString(16)
    .padStart(3, '0')}`;
  const cat = actionCategory(log.action);
  const diff = changeDiff(log.action);

  const meta: { label: string; value: React.ReactNode; mono?: boolean }[] = [
    { label: 'Actor', value: log.actor },
    { label: 'Action', value: log.action },
    { label: 'Target', value: log.target, mono: true },
    { label: 'Timestamp', value: formatDateTime(log.timestamp), mono: true },
    { label: 'IP address', value: log.ip, mono: true },
    { label: 'Session', value: session, mono: true },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-surface"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <Avatar name={log.actor} className="h-11 w-11 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={cat.variant}>{cat.label}</Badge>
                <span className="font-mono text-[11px] text-muted">{log.id}</span>
              </div>
              <h2 className="mt-1 text-base font-semibold text-foreground">{log.action}</h2>
              <p className="text-xs text-muted">by {log.actor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-elevated hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Event details */}
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Event details
            </h3>
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {meta.map((m) => (
                <div key={m.label} className="bg-card px-4 py-3">
                  <dt className="text-[11px] uppercase tracking-wide text-muted">{m.label}</dt>
                  <dd
                    className={
                      m.mono
                        ? 'mt-0.5 break-all font-mono text-xs text-foreground'
                        : 'mt-0.5 text-sm text-foreground'
                    }
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* User agent */}
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              User agent
            </h3>
            <p className="break-all rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-[11px] leading-relaxed text-secondary">
              {ua}
            </p>
          </div>

          {/* Change diff */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Change diff
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-muted">
                before <ArrowRight className="h-3 w-3" /> after
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-elevated font-mono text-xs">
              <div className="border-b border-border/60 px-3 py-1.5 text-[11px] text-muted">
                {log.target}.json
              </div>
              <div className="space-y-0.5 p-3">
                <div className="text-muted">{'{'}</div>
                {diff.map((d) => (
                  <React.Fragment key={d.field}>
                    <div className="flex items-start gap-2 rounded bg-danger/10 px-2 py-0.5 text-danger">
                      <span className="select-none opacity-70">-</span>
                      <span className="text-foreground/70">&quot;{d.field}&quot;:</span>
                      <span>{d.before}</span>
                    </div>
                    <div className="flex items-start gap-2 rounded bg-success/10 px-2 py-0.5 text-success">
                      <span className="select-none opacity-70">+</span>
                      <span className="text-foreground/70">&quot;{d.field}&quot;:</span>
                      <span>{d.after}</span>
                    </div>
                  </React.Fragment>
                ))}
                <div className="text-muted">{'}'}</div>
              </div>
            </div>
          </div>

          {/* Ledger note */}
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-muted">
              This entry is sealed in the immutable audit ledger. Hash chain verified —
              <span className="font-mono text-secondary">
                {' '}
                {initials(log.actor).toLowerCase()}
                {(h % 0xffffffff).toString(16).padStart(8, '0')}
              </span>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
