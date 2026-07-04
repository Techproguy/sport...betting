'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Users as UsersIcon, UserCheck, UserX, Gauge, Search, X, ChevronLeft, ChevronRight,
  Ban, PauseCircle, RotateCcw, SlidersHorizontal, Mail, Phone, MapPin, Eye,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatNumber, timeAgo, formatDate, cn } from '@/lib/utils';
import type { User } from '@/lib/types';

const PAGE_SIZE = 15;

function riskColor(score: number) {
  if (score < 40) return '#00D66F';
  if (score < 70) return '#FFC107';
  return '#FF4D4F';
}
function riskLabel(score: number) {
  if (score < 40) return 'Low';
  if (score < 70) return 'Medium';
  return 'High';
}

function RiskGauge({ score }: { score: number }) {
  const color = riskColor(score);
  const r = 52;
  const circ = Math.PI * r; // half circle
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="82" viewBox="0 0 140 82">
        <path d="M 18 74 A 52 52 0 0 1 122 74" fill="none" stroke="#1C1C1C" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d="M 18 74 A 52 52 0 0 1 122 74"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="-mt-8 text-center">
        <p className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</p>
        <p className="text-[11px] uppercase tracking-wide text-muted">{riskLabel(score)} risk</p>
      </div>
    </div>
  );
}

function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const { bets, transactions } = db();
  const userBets = bets.filter((b) => b.userId === user.id).slice(0, 5);
  const userTx = transactions.filter((t) => t.userId === user.id).slice(0, 5);

  const act = (label: string) => toast.success(`${label}`, `Applied to ${user.name}.`);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">User Detail</h2>
          <button onClick={onClose} className="text-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={`linear-gradient(135deg,${riskColor(user.riskScore)},#0891b2)`} className="h-14 w-14 text-base" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.id}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill status={user.status} />
                <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">{user.vip}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-border bg-card p-4 text-xs">
            <p className="flex items-center gap-2 text-secondary"><Mail className="h-3.5 w-3.5 text-muted" />{user.email}</p>
            <p className="flex items-center gap-2 text-secondary"><Phone className="h-3.5 w-3.5 text-muted" />{user.phone}</p>
            <p className="flex items-center gap-2 text-secondary"><MapPin className="h-3.5 w-3.5 text-muted" />{user.state}, {user.country}</p>
            <p className="text-muted">Member since {formatDate(user.joinedAt)}</p>
          </div>

          {/* Risk + KYC */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-1 text-xs font-semibold text-secondary">Risk Score</p>
              <RiskGauge score={user.riskScore} />
            </div>
            <div className="flex flex-col justify-center gap-3 rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-xs text-muted">KYC Status</p>
                <div className="mt-1"><StatusPill status={user.kycStatus} /></div>
              </div>
              <div>
                <p className="text-xs text-muted">Total Bets</p>
                <p className="text-sm font-bold tabular-nums">{formatNumber(user.totalBets)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Last Active</p>
                <p className="text-sm font-semibold">{timeAgo(user.lastActive)}</p>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Wallet</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Balance', formatCurrency(user.balance)],
                ['Pending', formatCurrency(user.pendingBalance)],
                ['Lifetime Deposits', formatCurrency(user.lifetimeDeposits)],
                ['Lifetime Withdrawals', formatCurrency(user.lifetimeWithdrawals)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[11px] text-muted">{l}</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent bets */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Recent Bets</p>
            <div className="space-y-1.5">
              {userBets.length === 0 && <p className="text-xs text-muted">No bets found.</p>}
              {userBets.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.legs[0]?.selectionLabel} {b.type === 'parlay' && <span className="text-muted">+{b.legs.length - 1}</span>}</p>
                    <p className="text-muted">{b.sport} · {formatCurrency(b.stake)}</p>
                  </div>
                  <StatusPill status={b.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Recent Transactions</p>
            <div className="space-y-1.5">
              {userTx.length === 0 && <p className="text-xs text-muted">No transactions found.</p>}
              {userTx.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs">
                  <div>
                    <p className="font-medium capitalize">{t.type} · {t.method}</p>
                    <p className="text-muted">{timeAgo(t.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-bold tabular-nums', t.type === 'deposit' ? 'text-success' : 'text-foreground')}>
                      {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <StatusPill status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
          <Button variant="secondary" size="sm" onClick={() => act('User suspended')}><PauseCircle className="h-4 w-4" />Suspend</Button>
          <Button variant="danger" size="sm" onClick={() => act('User banned')}><Ban className="h-4 w-4" />Ban</Button>
          <Button variant="outline" size="sm" onClick={() => act('KYC reset')}><RotateCcw className="h-4 w-4" />Reset KYC</Button>
          <Button variant="outline" size="sm" onClick={() => act('Limits adjusted')}><SlidersHorizontal className="h-4 w-4" />Adjust Limits</Button>
        </div>
      </motion.div>
    </>
  );
}

export default function AdminUsersPage() {
  const { users } = db();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [vip, setVip] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<User | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (query && !(`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(query.toLowerCase()))) return false;
      if (status !== 'all' && u.status !== status) return false;
      if (kycFilter !== 'all' && u.kycStatus !== kycFilter) return false;
      if (vip !== 'all' && u.vip !== vip) return false;
      return true;
    });
  }, [users, query, status, kycFilter, vip]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const avgRisk = Math.round(users.reduce((a, u) => a + u.riskScore, 0) / users.length);
  const activeCount = users.filter((u) => u.status === 'active').length;
  const flaggedCount = users.filter((u) => u.status === 'suspended' || u.status === 'banned').length;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const columns: Column<User>[] = [
    {
      key: 'user', header: 'User',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} className="h-9 w-9" />
          <div className="min-w-0">
            <p className="truncate font-medium">{u.name}</p>
            <p className="truncate text-xs text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'state', header: 'State', render: (u) => <span className="text-secondary">{u.state}</span> },
    { key: 'vip', header: 'VIP', render: (u) => <span className="text-xs font-semibold text-primary">{u.vip}</span> },
    { key: 'kyc', header: 'KYC', render: (u) => <StatusPill status={u.kycStatus} /> },
    { key: 'status', header: 'Status', render: (u) => <StatusPill status={u.status} /> },
    { key: 'balance', header: 'Balance', align: 'right', render: (u) => <span className="font-semibold tabular-nums">{formatCurrency(u.balance)}</span> },
    {
      key: 'risk', header: 'Risk', align: 'right',
      render: (u) => (
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums" style={{ color: riskColor(u.riskScore) }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: riskColor(u.riskScore) }} />{u.riskScore}
        </span>
      ),
    },
    { key: 'lastActive', header: 'Last Active', render: (u) => <span className="text-xs text-muted">{timeAgo(u.lastActive)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1" onClick={stop}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(u)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-warning" onClick={() => toast.warning('User suspended', u.name)}><PauseCircle className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => toast.error('User banned', u.name)}><Ban className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Users">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(users.length)} icon={UsersIcon} sub="All accounts" />
        <StatCard label="Active" value={formatNumber(activeCount)} icon={UserCheck} accent="#00D66F" delta="+3.4%" />
        <StatCard label="Suspended / Banned" value={formatNumber(flaggedCount)} icon={UserX} accent="#FF4D4F" sub="Restricted access" />
        <StatCard label="Avg Risk Score" value={`${avgRisk}`} icon={Gauge} accent={riskColor(avgRisk)} sub={`${riskLabel(avgRisk)} portfolio`} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search name, email, or ID…" className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 md:flex md:w-auto">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="md:w-36">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="restricted">Restricted</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </Select>
          <Select value={kycFilter} onChange={(e) => { setKycFilter(e.target.value); setPage(0); }} className="md:w-36">
            <option value="all">All KYC</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="not_started">Not started</option>
          </Select>
          <Select value={vip} onChange={(e) => { setVip(e.target.value); setPage(0); }} className="md:w-36">
            <option value="all">All VIP</option>
            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} onRowClick={setSelected} empty="No users match your filters." />

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>Showing {rows.length} of {formatNumber(filtered.length)} users</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="tabular-nums">Page {safePage + 1} / {pageCount}</span>
          <Button variant="secondary" size="sm" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <AnimatePresence>
        {selected && <UserDrawer key={selected.id} user={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </AdminPage>
  );
}
