'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock, CheckCircle2, Timer, ShieldAlert, Check, X, PauseCircle, Inbox, Banknote,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard, EmptyState } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { AreaTrend, Donut } from '@/components/charts/Charts';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatCompact, formatDateTime } from '@/lib/utils';
import type { Transaction, User } from '@/lib/types';

const DONUT_PALETTE = ['#00D66F', '#3B82F6', '#FFC107', '#FF4D4F', '#A855F7', '#22D3EE', '#EC4899', '#FB923C'];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

function riskFor(tx: Transaction, user?: User) {
  const score = user ? user.riskScore : hash(tx.id) % 100;
  if (score < 40) return { score, label: 'Low', color: '#00D66F' };
  if (score < 70) return { score, label: 'Medium', color: '#FFC107' };
  return { score, label: 'High', color: '#FF4D4F' };
}

export default function AdminWithdrawalsPage() {
  const { transactions, users, series } = db();

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const withdrawals = useMemo(
    () => transactions.filter((t) => t.type === 'withdrawal'),
    [transactions],
  );

  // Approval queue — local state so actions can remove items
  const [queue, setQueue] = useState<Transaction[]>(() =>
    withdrawals.filter((t) => t.status === 'pending' || t.status === 'processing'),
  );

  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const methods = useMemo(
    () => Array.from(new Set(withdrawals.map((t) => t.method))),
    [withdrawals],
  );

  // Stats
  const pendingTotal = useMemo(
    () => queue.reduce((sum, t) => sum + t.amount, 0),
    [queue],
  );
  const approvedToday = useMemo(
    () => Math.max(4, Math.round(withdrawals.filter((t) => t.status === 'completed').length * 0.18)),
    [withdrawals],
  );
  const flaggedCount = useMemo(
    () => queue.filter((t) => riskFor(t, userById.get(t.userId)).score >= 70).length,
    [queue, userById],
  );

  // Method donut (by total value)
  const donutData = useMemo(() => {
    const byMethod = new Map<string, number>();
    for (const t of withdrawals) byMethod.set(t.method, (byMethod.get(t.method) ?? 0) + t.amount);
    return Array.from(byMethod.entries()).map(([name, value], i) => ({
      name,
      value: Math.round(value),
      color: DONUT_PALETTE[i % DONUT_PALETTE.length],
    }));
  }, [withdrawals]);

  const resolve = (tx: Transaction, action: 'approve' | 'reject' | 'hold') => {
    setQueue((prev) => prev.filter((t) => t.id !== tx.id));
    const name = userById.get(tx.userId)?.name ?? tx.userId;
    const amount = formatCurrency(tx.amount);
    if (action === 'approve') toast.success('Withdrawal approved', `${amount} to ${name} · ${tx.method}`);
    else if (action === 'reject') toast.error('Withdrawal rejected', `${amount} · ${name}`);
    else toast.warning('Withdrawal on hold', `${amount} · ${name} flagged for review`);
  };

  // Full table filtering
  const filtered = useMemo(
    () =>
      withdrawals.filter(
        (t) =>
          (methodFilter === 'all' || t.method === methodFilter) &&
          (statusFilter === 'all' || t.status === statusFilter),
      ),
    [withdrawals, methodFilter, statusFilter],
  );

  const columns: Column<Transaction>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (t) => <span className="font-mono text-xs text-secondary">{t.reference}</span>,
    },
    {
      key: 'user',
      header: 'User',
      render: (t) => {
        const u = userById.get(t.userId);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={u?.name ?? t.userId} className="h-8 w-8" />
            <span className="font-medium">{u?.name ?? t.userId}</span>
          </div>
        );
      },
    },
    { key: 'method', header: 'Method', render: (t) => <span className="text-secondary">{t.method}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (t) => <span className="font-semibold tabular-nums">{formatCurrency(t.amount)}</span>,
    },
    { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
    {
      key: 'date',
      header: 'Date',
      render: (t) => <span className="text-xs text-muted">{formatDateTime(t.createdAt)}</span>,
    },
  ];

  return (
    <AdminPage title="Withdrawals">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending Payout" value={formatCurrency(pendingTotal)} icon={Clock} accent="#FFC107" sub={`${queue.length} awaiting approval`} />
        <StatCard label="Approved Today" value={`${approvedToday}`} icon={CheckCircle2} accent="#00D66F" delta="+12%" />
        <StatCard label="Avg Processing" value="3.2h" icon={Timer} accent="#3B82F6" sub="Request to payout" />
        <StatCard label="Flagged (High Risk)" value={`${flaggedCount}`} icon={ShieldAlert} accent="#FF4D4F" sub="Needs manual review" />
      </div>

      {/* Approval queue */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Approval Queue</h3>
            <span className="rounded-full bg-warning/12 px-2 py-0.5 text-[11px] font-semibold text-warning tabular-nums">
              {queue.length} pending
            </span>
          </div>
          <span className="text-xs text-muted tabular-nums">{formatCurrency(pendingTotal)} exposure</span>
        </div>

        {queue.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Queue is clear"
            description="Every withdrawal request has been actioned. New requests will appear here for review."
          />
        ) : (
          <motion.ul layout className="space-y-2.5">
            <AnimatePresence initial={false}>
              {queue.map((tx) => {
                const user = userById.get(tx.userId);
                const risk = riskFor(tx, user);
                return (
                  <motion.li
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                    className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-elevated/60 p-3.5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={user?.name ?? tx.userId} className="h-10 w-10 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{user?.name ?? tx.userId}</p>
                          <span className="font-mono text-[11px] text-muted">{tx.reference}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold tabular-nums">{formatCurrency(tx.amount)}</span>
                          <span className="text-xs text-secondary">via {tx.method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="uppercase tracking-wide">KYC</span>
                        <StatusPill status={user?.kycStatus ?? 'approved'} />
                      </div>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
                        style={{ background: `${risk.color}1f`, color: risk.color }}
                      >
                        {risk.label} risk · {risk.score}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button variant="primary" size="sm" onClick={() => resolve(tx, 'approve')}>
                          <Check className="h-4 w-4" />Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => resolve(tx, 'reject')}>
                          <X className="h-4 w-4" />Reject
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => resolve(tx, 'hold')}>
                          <PauseCircle className="h-4 w-4" />Hold
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Withdrawal Volume</h3>
            <span className="text-xs text-muted">Last 30 days</span>
          </div>
          <AreaTrend data={series.daily} x="day" y="withdrawals" color="#3B82F6" format={(v) => formatCompact(v)} />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">By Method</h3>
            <Banknote className="h-4 w-4 text-muted" />
          </div>
          <Donut data={donutData} />
          <ul className="mt-4 space-y-1.5">
            {donutData.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-secondary">{d.name}</span>
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Full table */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-sm font-semibold">All Withdrawals</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={methodFilter}
              onChange={setMethodFilter}
              tabs={[{ value: 'all', label: 'All methods' }, ...methods.map((m) => ({ value: m, label: m }))]}
            />
            <Tabs
              value={statusFilter}
              onChange={setStatusFilter}
              tabs={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
          </div>
        </div>
        <DataTable columns={columns} rows={filtered} empty="No withdrawals match these filters." />
      </div>
    </AdminPage>
  );
}
