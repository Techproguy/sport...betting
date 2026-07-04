'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Hash, TrendingUp, AlertTriangle, Search, Check, RotateCcw,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { AreaTrend, Donut } from '@/components/charts/Charts';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatCompact, formatNumber, formatDateTime, cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const ROW_LIMIT = 40;

const METHODS = ['Visa', 'Mastercard', 'ACH', 'PayPal', 'Apple Pay'] as const;
const METHOD_COLOR: Record<string, string> = {
  Visa: '#00D66F',
  Mastercard: '#3B82F6',
  ACH: '#FFC107',
  PayPal: '#A855F7',
  'Apple Pay': '#22D3EE',
};

function shortId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export default function AdminDepositsPage() {
  const { transactions, users, series } = db();

  const deposits = useMemo(
    () => transactions.filter((t) => t.type === 'deposit'),
    [transactions],
  );

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const userName = (id: string) => userById.get(id)?.name ?? shortId(id);

  // Local status overrides from Approve/Retry actions (deterministic base data).
  const [overrides, setOverrides] = useState<Record<string, Transaction['status']>>({});
  const statusOf = (t: Transaction): Transaction['status'] => overrides[t.id] ?? t.status;

  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');

  // Stats ------------------------------------------------------------------
  const total = deposits.length;
  const failedCount = deposits.filter((t) => statusOf(t) === 'failed').length;
  const totalAmount = deposits.reduce((a, t) => a + t.amount, 0);
  const avgDeposit = total ? totalAmount / total : 0;
  const failedRate = total ? (failedCount / total) * 100 : 0;
  // Deterministic "today" slice: the most recent 24 deposits by index order.
  const todaySlice = deposits.slice(0, 24);
  const todayAmount = todaySlice.reduce((a, t) => a + t.amount, 0);

  // Method breakdown -------------------------------------------------------
  const methodBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; sum: number }>();
    for (const m of METHODS) counts.set(m, { count: 0, sum: 0 });
    for (const t of deposits) {
      const entry = counts.get(t.method) ?? { count: 0, sum: 0 };
      entry.count += 1;
      entry.sum += t.amount;
      counts.set(t.method, entry);
    }
    return METHODS.map((m) => ({
      name: m,
      value: counts.get(m)!.count,
      sum: counts.get(m)!.sum,
      color: METHOD_COLOR[m],
    }));
  }, [deposits]);

  // Filtered rows ----------------------------------------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deposits.filter((t) => {
      if (method !== 'all' && t.method !== method) return false;
      if (status !== 'all' && statusOf(t) !== status) return false;
      if (q && !(`${t.reference} ${userName(t.userId)}`.toLowerCase().includes(q))) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deposits, method, status, query, overrides]);

  const rows = filtered.slice(0, ROW_LIMIT);

  const approve = (t: Transaction) => {
    setOverrides((o) => ({ ...o, [t.id]: 'completed' }));
    toast.success('Deposit approved', `${t.reference} · ${formatCurrency(t.amount)} credited to ${userName(t.userId)}.`);
  };
  const retry = (t: Transaction) => {
    setOverrides((o) => ({ ...o, [t.id]: 'processing' }));
    toast.info('Retrying deposit', `${t.reference} re-submitted to ${t.method}.`);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const columns: Column<Transaction>[] = [
    {
      key: 'reference', header: 'Reference',
      render: (t) => <span className="font-mono text-xs font-semibold text-secondary">{t.reference}</span>,
    },
    {
      key: 'user', header: 'User',
      render: (t) => <span className="font-medium">{userName(t.userId)}</span>,
    },
    {
      key: 'method', header: 'Method',
      render: (t) => (
        <span className="inline-flex items-center gap-1.5 text-secondary">
          <span className="h-2 w-2 rounded-full" style={{ background: METHOD_COLOR[t.method] ?? '#6B6B6B' }} />
          {t.method}
        </span>
      ),
    },
    {
      key: 'amount', header: 'Amount', align: 'right',
      render: (t) => <span className="font-semibold tabular-nums text-success">{formatCurrency(t.amount)}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (t) => <StatusPill status={statusOf(t)} />,
    },
    {
      key: 'date', header: 'Date',
      render: (t) => <span className="text-xs text-muted">{formatDateTime(t.createdAt)}</span>,
    },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (t) => {
        const s = statusOf(t);
        if (s === 'pending') {
          return (
            <div className="flex justify-end" onClick={stop}>
              <Button variant="primary" size="sm" onClick={() => approve(t)}><Check className="h-3.5 w-3.5" />Approve</Button>
            </div>
          );
        }
        if (s === 'failed') {
          return (
            <div className="flex justify-end" onClick={stop}>
              <Button variant="outline" size="sm" onClick={() => retry(t)}><RotateCcw className="h-3.5 w-3.5" />Retry</Button>
            </div>
          );
        }
        return <span className="block text-right text-muted">—</span>;
      },
    },
  ];

  return (
    <AdminPage title="Deposits">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's Deposits" value={formatCurrency(todayAmount)} icon={DollarSign} accent="#00D66F" delta="+8.1%" sub={`${todaySlice.length} settled today`} />
          <StatCard label="Total Deposits" value={formatNumber(total)} icon={Hash} accent="#3B82F6" sub="All-time count" />
          <StatCard label="Avg Deposit" value={formatCurrency(avgDeposit)} icon={TrendingUp} accent="#A855F7" sub="Per transaction" />
          <StatCard label="Failed Rate" value={`${failedRate.toFixed(1)}%`} icon={AlertTriangle} accent="#FF4D4F" sub={`${formatNumber(failedCount)} failed`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="rounded-lg border border-border bg-card p-5 lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Deposit volume (30d)</h3>
              <span className="text-xs text-muted">Daily settled deposits</span>
            </div>
            <AreaTrend data={series.daily} x="day" y="deposits" color="#00D66F" height={260} format={formatCompact} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">By Method</h3>
              <span className="text-xs text-muted">{formatNumber(total)} total</span>
            </div>
            <Donut data={methodBreakdown} height={180} />
            <ul className="mt-4 space-y-2">
              {methodBreakdown.map((m) => (
                <li key={m.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-secondary">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                    {m.name}
                  </span>
                  <span className="font-semibold tabular-nums">{formatNumber(m.value)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference or user…" className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
            <Select value={method} onChange={(e) => setMethod(e.target.value)} className="md:w-40">
              <option value="all">All methods</option>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-40">
              <option value="all">All status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>

        <DataTable columns={columns} rows={rows} empty="No deposits match your filters." />

        <p className={cn('text-xs text-muted')}>
          Showing {rows.length} of {formatNumber(filtered.length)} deposits
        </p>
      </div>
    </AdminPage>
  );
}
