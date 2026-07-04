'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, Download, Receipt, TrendingUp } from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { StatCard, EmptyState } from '@/components/ui/misc';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/store/toast';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const PAGE_SIZE = 12;

export default function TransactionsPage() {
  const user = currentUser();
  const all = React.useMemo<Transaction[]>(
    () =>
      db()
        .transactions.filter((t) => t.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [user.id]
  );

  const [type, setType] = React.useState('all');
  const [statusF, setStatusF] = React.useState('all');
  const [methodF, setMethodF] = React.useState('all');
  const [limit, setLimit] = React.useState(PAGE_SIZE);

  const methods = React.useMemo(() => Array.from(new Set(all.map((t) => t.method))), [all]);

  const filtered = React.useMemo(
    () =>
      all.filter(
        (t) =>
          (type === 'all' || t.type === type) &&
          (statusF === 'all' || t.status === statusF) &&
          (methodF === 'all' || t.method === methodF)
      ),
    [all, type, statusF, methodF]
  );

  React.useEffect(() => setLimit(PAGE_SIZE), [type, statusF, methodF]);

  const visible = filtered.slice(0, limit);

  const totalDeposited = all.filter((t) => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = all.filter((t) => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const net = totalDeposited - totalWithdrawn;

  const columns: Column<Transaction>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (r) => <span className="font-mono text-xs tabular-nums text-secondary">{r.reference}</span>,
    },
    { key: 'createdAt', header: 'Date', render: (r) => <span className="text-secondary">{formatDate(r.createdAt)}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (r) => {
        const isDeposit = r.type === 'deposit';
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md',
                isDeposit ? 'bg-success/12 text-success' : 'bg-info/12 text-info'
              )}
            >
              {isDeposit ? <ArrowDownToLine className="h-3.5 w-3.5" /> : <ArrowUpFromLine className="h-3.5 w-3.5" />}
            </span>
            <span className="font-medium capitalize">{r.type}</span>
          </span>
        );
      },
    },
    { key: 'method', header: 'Method', render: (r) => <span className="text-secondary">{r.method}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => (
        <span className={cn('font-semibold tabular-nums', r.type === 'deposit' ? 'text-success' : 'text-foreground')}>
          {r.type === 'deposit' ? '+' : ''}
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', align: 'right', render: (r) => <StatusPill status={r.status} /> },
  ];

  function exportCsv() {
    toast.success('Export started', `${filtered.length} transactions exported to CSV.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-secondary">A complete record of every deposit and withdrawal on your account.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Deposited" value={formatCurrency(totalDeposited)} icon={ArrowDownToLine} accent="#00D66F" sub="Settled deposits" />
        <StatCard label="Total Withdrawn" value={formatCurrency(totalWithdrawn)} icon={ArrowUpFromLine} accent="#3B82F6" sub="Settled withdrawals" />
        <StatCard
          label="Net Movement"
          value={formatCurrency(net)}
          icon={TrendingUp}
          accent={net >= 0 ? '#00D66F' : '#FF4D4F'}
          delta={net >= 0 ? '+ Positive' : '- Negative'}
          sub="Deposits minus withdrawals"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </Select>
        <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </Select>
        <Select value={methodF} onChange={(e) => setMethodF(e.target.value)} aria-label="Filter by method">
          <option value="all">All methods</option>
          {methods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="No records match your current filters. Try adjusting the type, status, or method."
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <DataTable columns={columns} rows={visible} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted tabular-nums">
              Showing {visible.length} of {filtered.length}
            </p>
            {visible.length < filtered.length && (
              <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Load more
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <p className="pb-2 text-center text-xs text-muted">
        21+. Please play responsibly. Gambling problem? Call 1-800-GAMBLER.
      </p>
    </div>
  );
}
