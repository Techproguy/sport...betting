'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, ShieldCheck, Users, Activity, Copy, Globe, MapPin,
  Gift, Flame, X, Eye, Smartphone, Wifi, Link2, Clock, ArrowUpCircle, Snowflake,
  CheckCircle2, XCircle, Fingerprint,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, SeverityPill, type Column } from '@/components/admin/DataTable';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { timeAgo, formatNumber, cn } from '@/lib/utils';
import type { FraudCase } from '@/lib/types';

// -------- deterministic hash (no render-time randomness) --------
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const SIGNAL_POOL = [
  'Multiple accounts', 'VPN detected', 'Location mismatch',
  'Bonus abuse', 'Device fingerprint reuse', 'Velocity spike',
] as const;

function signalsFor(id: string): string[] {
  const h = hash(id);
  const picked = SIGNAL_POOL.filter((_, i) => (h >> i) & 1);
  return picked.length ? picked : [SIGNAL_POOL[h % SIGNAL_POOL.length]];
}

function linkedAccountsFor(id: string): string[] {
  const h = hash(id);
  const n = 2 + (h % 2); // 2 or 3
  return Array.from({ length: n }, (_, k) =>
    `usr_${String(((h + (k + 1) * 37) % 100) + 1).padStart(4, '0')}`
  );
}

interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
  types?: string[];
  highRisk?: boolean;
}

const CATEGORIES: Category[] = [
  { key: 'suspicious', label: 'Suspicious betting', icon: Activity, types: ['Arbitrage pattern', 'Structuring deposits'] },
  { key: 'multi', label: 'Multiple accounts', icon: Copy, types: ['Multiple accounts'] },
  { key: 'vpn', label: 'VPN usage', icon: Globe, types: ['VPN / proxy usage'] },
  { key: 'location', label: 'Location mismatch', icon: MapPin, types: ['Location mismatch'] },
  { key: 'bonus', label: 'Bonus abuse', icon: Gift, types: ['Bonus abuse'] },
  { key: 'highrisk', label: 'High-risk users', icon: Flame, highRisk: true },
];

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
];

// ---------------------------------- Drawer ----------------------------------
function CaseDrawer({
  fraud,
  riskScore,
  onClose,
  onAction,
}: {
  fraud: FraudCase;
  riskScore: number;
  onClose: () => void;
  onAction: (kind: 'escalate' | 'freeze' | 'resolve' | 'dismiss') => void;
}) {
  const signals = signalsFor(fraud.id);
  const linked = linkedAccountsFor(fraud.id);

  const timeline = [
    { label: 'Detected', time: timeAgo(fraud.detectedAt), done: true },
    { label: 'Auto-flagged by risk engine', time: 'moments later', done: true },
    {
      label: 'Under review',
      time: fraud.status === 'investigating' || fraud.status === 'escalated' ? 'in progress' : 'queued',
      done: fraud.status === 'investigating' || fraud.status === 'escalated' || fraud.status === 'resolved',
    },
    {
      label: 'Pending action',
      time: fraud.status === 'resolved' ? 'closed' : 'awaiting decision',
      done: fraud.status === 'resolved',
    },
  ];

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
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{fraud.id}</span>
              <SeverityPill level={fraud.severity} />
            </div>
            <p className="mt-1 text-xs text-muted">{fraud.type} · {fraud.userName}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <ShieldAlert className="h-3.5 w-3.5" /> Case summary
            </p>
            <p className="text-sm leading-relaxed text-secondary">{fraud.detail}</p>
            <div className="mt-3"><StatusPill status={fraud.status} /></div>
          </div>

          {/* Signals */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Fingerprint className="h-3.5 w-3.5" /> Detection signals
            </p>
            <div className="flex flex-wrap gap-2">
              {signals.map((s) => (
                <span key={s} className="rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 text-[11px] font-semibold text-danger">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Linked accounts */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Link2 className="h-3.5 w-3.5" /> Linked accounts
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {linked.map((id) => (
                <div key={id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs">
                  <span className="font-mono text-secondary">{id}</span>
                  <span className="text-[11px] text-muted">shared fingerprint</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device + IP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-muted"><Smartphone className="h-3.5 w-3.5" /> Device</p>
              <p className="mt-1 text-sm font-semibold">{fraud.device}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-muted"><Wifi className="h-3.5 w-3.5" /> IP address</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{fraud.ip}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-muted"><Flame className="h-3.5 w-3.5" /> Account risk score</p>
              <p className={cn('mt-1 text-sm font-bold tabular-nums', riskScore > 70 ? 'text-danger' : riskScore > 40 ? 'text-warning' : 'text-success')}>
                {riskScore} / 100
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Clock className="h-3.5 w-3.5" /> Timeline
            </p>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn('mt-0.5 h-2.5 w-2.5 rounded-full', step.done ? 'bg-primary' : 'border border-border bg-elevated')} />
                    {i < timeline.length - 1 && <span className="my-0.5 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className={cn('text-sm font-medium', step.done ? 'text-foreground' : 'text-muted')}>{step.label}</p>
                    <p className="text-[11px] text-muted">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
          <Button variant="secondary" size="sm" onClick={() => onAction('escalate')}><ArrowUpCircle className="h-4 w-4" />Escalate</Button>
          <Button variant="outline" size="sm" onClick={() => onAction('freeze')}><Snowflake className="h-4 w-4" />Freeze account</Button>
          <Button variant="primary" size="sm" onClick={() => onAction('resolve')}><CheckCircle2 className="h-4 w-4" />Mark resolved</Button>
          <Button variant="danger" size="sm" onClick={() => onAction('dismiss')}><XCircle className="h-4 w-4" />Dismiss</Button>
        </div>
      </motion.div>
    </>
  );
}

// ---------------------------------- Page ----------------------------------
export default function AdminFraudPage() {
  const { fraud, users } = db();
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const [cases, setCases] = useState<FraudCase[]>(() => fraud);
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<FraudCase | null>(null);

  const riskOf = (userId: string) => userById.get(userId)?.riskScore ?? 0;

  // ---- StatCards ----
  const openCases = cases.filter((c) => c.status === 'open' || c.status === 'investigating').length;
  const criticalCount = cases.filter((c) => c.severity === 'critical').length;
  const resolvedThisWeek = cases.filter((c) => c.status === 'resolved' && hash(c.id) % 2 === 0).length;
  const flaggedUsers = new Set(cases.map((c) => c.userId)).size;

  const highRiskUserCount = users.filter((u) => u.riskScore > 70).length;

  // ---- Category counts ----
  const categoryCount = (cat: Category) => {
    if (cat.highRisk) return highRiskUserCount;
    return cases.filter((c) => cat.types?.includes(c.type)).length;
  };

  // ---- Filtering ----
  const activeCat = CATEGORIES.find((c) => c.key === category) ?? null;

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (severity !== 'all' && c.severity !== severity) return false;
      if (activeCat) {
        if (activeCat.highRisk) {
          if (riskOf(c.userId) <= 70) return false;
        } else if (!activeCat.types?.includes(c.type)) {
          return false;
        }
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, status, severity, activeCat]);

  const selectCategory = (cat: Category) => {
    if (category === cat.key) {
      setCategory(null);
      toast.info('Filter cleared', 'Showing all detection categories.');
    } else {
      setCategory(cat.key);
      toast.info(`Filtered: ${cat.label}`, `${categoryCount(cat)} matching signal${categoryCount(cat) === 1 ? '' : 's'}.`);
    }
  };

  const handleAction = (kind: 'escalate' | 'freeze' | 'resolve' | 'dismiss') => {
    if (!selected) return;
    const c = selected;
    switch (kind) {
      case 'escalate':
        setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'escalated' } : x)));
        toast.warning('Case escalated', `${c.id} routed to compliance review.`);
        break;
      case 'freeze':
        setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'investigating' } : x)));
        toast.warning('Account frozen', `${c.userName}'s account has been locked.`);
        break;
      case 'resolve':
        setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'resolved' } : x)));
        toast.success('Case resolved', `${c.id} marked as resolved.`);
        break;
      case 'dismiss':
        setCases((prev) => prev.filter((x) => x.id !== c.id));
        toast.info('Case dismissed', `${c.id} removed as a false positive.`);
        break;
    }
    setSelected(null);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const columns: Column<FraudCase>[] = [
    { key: 'id', header: 'Case ID', render: (c) => <span className="font-mono text-xs font-semibold">{c.id}</span> },
    { key: 'user', header: 'User', render: (c) => <span className="font-medium">{c.userName}</span> },
    { key: 'type', header: 'Type', render: (c) => <span className="text-secondary">{c.type}</span> },
    { key: 'severity', header: 'Severity', render: (c) => <SeverityPill level={c.severity} /> },
    { key: 'detected', header: 'Detected', render: (c) => <span className="text-xs text-muted">{timeAgo(c.detectedAt)}</span> },
    { key: 'device', header: 'Device', render: (c) => <span className="text-xs text-secondary">{c.device}</span> },
    { key: 'ip', header: 'IP', render: (c) => <span className="text-xs tabular-nums text-muted">{c.ip}</span> },
    { key: 'status', header: 'Status', render: (c) => <StatusPill status={c.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (c) => (
        <div className="flex justify-end" onClick={stop}>
          <Button variant="ghost" size="sm" onClick={() => setSelected(c)}><Eye className="h-4 w-4" />View</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Fraud Detection">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open cases" value={formatNumber(openCases)} icon={ShieldAlert} accent="#FFC107" sub="Open + investigating" />
          <StatCard label="Critical" value={formatNumber(criticalCount)} icon={AlertTriangle} accent="#FF4D4F" sub="Highest severity" />
          <StatCard label="Resolved this week" value={formatNumber(resolvedThisWeek)} icon={ShieldCheck} accent="#00D66F" delta="+12%" />
          <StatCard label="Flagged users" value={formatNumber(flaggedUsers)} icon={Users} accent="#3B82F6" sub="Distinct accounts" />
        </div>

        {/* Detection categories */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Detection categories</h3>
            <span className="text-xs text-muted">Tap to filter the case queue</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat, i) => {
              const active = category === cat.key;
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => selectCategory(cat)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                    active ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-border/80 hover:bg-elevated/50'
                  )}
                >
                  <span
                    className={cn('flex h-9 w-9 items-center justify-center rounded-lg', active ? 'bg-primary/20 text-primary' : 'bg-elevated text-secondary')}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-2xl font-bold tabular-nums">{categoryCount(cat)}</span>
                  <span className="text-xs font-medium text-secondary">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={STATUS_TABS} value={status} onChange={setStatus} />
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="lg:w-44">
            <option value="all">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>

        {activeCat && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Filtered by</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-0.5 font-semibold text-primary">
              {activeCat.label}
              <button onClick={() => setCategory(null)} className="hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}

        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={setSelected}
          empty="No fraud cases match your filters."
        />

        <p className="text-xs text-muted">
          Showing {filtered.length} of {cases.length} active cases · Automated risk engine v3.2
        </p>
      </div>

      <AnimatePresence>
        {selected && (
          <CaseDrawer
            key={selected.id}
            fraud={selected}
            riskScore={riskOf(selected.userId)}
            onClose={() => setSelected(null)}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
