'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Landmark,
  Wallet,
  Apple,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Percent,
  Banknote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, StatusPill } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { AreaTrend } from '@/components/charts/Charts';
import { StatCard, Switch, Progress } from '@/components/ui/misc';
import { toast } from '@/store/toast';
import { db } from '@/lib/mock/db';
import { formatCurrency, formatDate } from '@/lib/utils';

// ---- deterministic hash (no render-time Math.random) ----
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const PROVIDERS = ['Visa', 'Mastercard', 'ACH', 'PayPal', 'Apple Pay'] as const;
type Provider = (typeof PROVIDERS)[number];

const PROVIDER_ICON: Record<Provider, LucideIcon> = {
  Visa: CreditCard,
  Mastercard: CreditCard,
  ACH: Landmark,
  PayPal: Wallet,
  'Apple Pay': Apple,
};

const PROVIDER_ACCENT: Record<Provider, string> = {
  Visa: '#3B82F6',
  Mastercard: '#FB923C',
  ACH: '#22D3EE',
  PayPal: '#A855F7',
  'Apple Pay': '#00D66F',
};

// per-method processing fee rates (%)
const FEE_RATE: Record<Provider, number> = {
  Visa: 2.9,
  Mastercard: 2.9,
  ACH: 0.8,
  PayPal: 3.4,
  'Apple Pay': 2.9,
};

interface ProviderStat {
  name: Provider;
  volume: number;
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  spark: { i: number; v: number }[];
}

interface Dispute {
  id: string;
  user: string;
  method: Provider;
  amount: number;
  reason: string;
  status: string;
  date: string;
}

const REASONS = ['Fraudulent', 'Product not received', 'Duplicate', 'Unrecognized'];
const DISPUTE_STATUS = ['open', 'investigating', 'resolved', 'won', 'lost'];

export default function PaymentsPage() {
  const data = db();

  // ---- derive per-provider stats from transactions grouped by method ----
  const providerStats = React.useMemo<ProviderStat[]>(() => {
    return PROVIDERS.map((name) => {
      const txs = data.transactions.filter((t) => t.method === name);
      const total = txs.length;
      const completed = txs.filter((t) => t.status === 'completed').length;
      const failed = txs.filter((t) => t.status === 'failed').length;
      const volume = txs.reduce((s, t) => s + Math.abs(t.amount), 0);
      const successRate = total ? (completed / total) * 100 : 0;
      const spark = Array.from({ length: 12 }, (_, i) => ({
        i,
        v: 82 + (hash(`${name}-${i}`) % 18),
      }));
      return { name, volume, total, completed, failed, successRate, spark };
    });
  }, [data.transactions]);

  // lowest-success provider is flagged degraded, the rest operational
  const minRate = Math.min(...providerStats.map((p) => p.successRate));
  const isDegraded = (p: ProviderStat) => p.successRate === minRate;

  // ---- provider enable/disable toggles (local state) ----
  const [enabled, setEnabled] = React.useState<Record<Provider, boolean>>({
    Visa: true,
    Mastercard: true,
    ACH: true,
    PayPal: true,
    'Apple Pay': true,
  });

  function toggleProvider(name: Provider) {
    setEnabled((prev) => {
      const next = !prev[name];
      if (next) toast.info(`${name} enabled`, 'Provider is now accepting transactions.');
      else toast.warning(`${name} disabled`, 'New transactions will be routed away.');
      return { ...prev, [name]: next };
    });
  }

  // ---- fee summary ----
  const feeRows = providerStats.map((p) => ({
    name: p.name,
    rate: FEE_RATE[p.name],
    volume: p.volume,
    fee: p.volume * (FEE_RATE[p.name] / 100),
  }));
  const grossVolume = feeRows.reduce((s, r) => s + r.volume, 0);
  const totalFees = feeRows.reduce((s, r) => s + r.fee, 0);

  // refunds derived from failed transactions (deterministic)
  const refunds = data.transactions
    .filter((t) => t.status === 'failed')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const netSettlement = grossVolume - totalFees - refunds;

  const overallSuccess =
    providerStats.reduce((s, p) => s + p.completed, 0) /
    Math.max(1, providerStats.reduce((s, p) => s + p.total, 0)) *
    100;

  // ---- disputes / chargebacks (deterministic) ----
  const disputes = React.useMemo<Dispute[]>(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const h = hash(`dsp-${i}`);
      const user = data.users[h % data.users.length];
      const method = PROVIDERS[h % PROVIDERS.length];
      const amount = [75, 120, 240, 480, 620, 900, 1500, 2500][h % 8];
      const date = new Date(Date.UTC(2026, 5, 30 - (h % 26))).toISOString();
      return {
        id: `dsp_${1000 + (h % 9000)}`,
        user: user.name,
        method,
        amount,
        reason: REASONS[h % REASONS.length],
        status: DISPUTE_STATUS[hash(`dsp-status-${i}`) % DISPUTE_STATUS.length],
        date,
      };
    });
  }, [data.users]);

  const disputeColumns: Column<Dispute>[] = [
    {
      key: 'id',
      header: 'Dispute',
      render: (r) => <span className="font-mono text-xs text-secondary">{r.id}</span>,
    },
    { key: 'user', header: 'Customer', render: (r) => <span className="font-medium">{r.user}</span> },
    { key: 'method', header: 'Method', render: (r) => <span className="text-secondary">{r.method}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (r) => <span className="tabular-nums font-semibold">{formatCurrency(r.amount)}</span>,
    },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-secondary">{r.reason}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'date',
      header: 'Opened',
      align: 'right',
      render: (r) => <span className="tabular-nums text-secondary">{formatDate(r.date)}</span>,
    },
  ];

  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;

  return (
    <AdminPage title="Payments">
      <div className="space-y-6">
        {/* summary stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Gross Volume" value={formatCurrency(grossVolume)} icon={DollarSign} accent="#00D66F" sub="Across all PSPs" />
          <StatCard label="Processing Fees" value={formatCurrency(totalFees)} icon={Percent} accent="#FFC107" sub={`${((totalFees / Math.max(1, grossVolume)) * 100).toFixed(2)}% blended`} />
          <StatCard label="Auth Success" value={`${overallSuccess.toFixed(1)}%`} icon={ShieldCheck} accent="#3B82F6" sub="Completed / total" />
          <StatCard label="Open Disputes" value={String(openDisputes)} icon={AlertTriangle} accent="#FF4D4F" sub={`${disputes.length} total this cycle`} />
        </div>

        {/* provider health cards */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Provider Health</h2>
            <span className="text-xs text-muted">Real-time PSP status</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {providerStats.map((p, idx) => {
              const Icon = PROVIDER_ICON[p.name];
              const accent = PROVIDER_ACCENT[p.name];
              const degraded = isDegraded(p);
              const on = enabled[p.name];
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                  className={`relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-opacity ${
                    on ? 'opacity-100' : 'opacity-45'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: `${accent}1f`, color: accent }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{p.name}</p>
                        <StatusPill status={on ? (degraded ? 'processing' : 'active') : 'inactive'} />
                      </div>
                    </div>
                    <Switch checked={on} onChange={() => toggleProvider(p.name)} />
                  </div>

                  <div className="mt-3">
                    <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: on ? accent : undefined }}>
                      {p.successRate.toFixed(1)}%
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Success rate</p>
                  </div>

                  <div className="-mx-1 mt-1">
                    <AreaTrend data={p.spark} x="i" y="v" height={60} color={degraded ? '#FFC107' : accent} format={(v) => `${v}%`} />
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                    <span className="text-muted">Volume</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(p.volume)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* fees + settlement */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* fee summary */}
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Transaction Fee Summary</h3>
              <span className="text-xs text-muted">Per-method processing cost</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                    <th className="py-2 text-left font-semibold">Method</th>
                    <th className="py-2 text-right font-semibold">Rate</th>
                    <th className="py-2 text-right font-semibold">Volume</th>
                    <th className="py-2 text-right font-semibold">Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRows.map((r) => (
                    <tr key={r.name} className="border-b border-border/60">
                      <td className="py-2.5 font-medium">{r.name}</td>
                      <td className="py-2.5 text-right tabular-nums text-secondary">{r.rate.toFixed(1)}%</td>
                      <td className="py-2.5 text-right tabular-nums">{formatCurrency(r.volume)}</td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-warning">{formatCurrency(r.fee)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 text-sm font-semibold" colSpan={2}>
                      Total
                    </td>
                    <td className="pt-3 text-right tabular-nums font-semibold">{formatCurrency(grossVolume)}</td>
                    <td className="pt-3 text-right tabular-nums font-bold text-warning">{formatCurrency(totalFees)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* settlement / reconciliation */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Settlement</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> Balanced
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Gross volume" value={formatCurrency(grossVolume)} />
              <Row label="Processing fees" value={`- ${formatCurrency(totalFees)}`} tone="text-warning" />
              <Row label="Refunds" value={`- ${formatCurrency(refunds)}`} tone="text-danger" />
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Net settlement</span>
                  <span className="tabular-nums text-lg font-bold text-primary">{formatCurrency(netSettlement)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                <span>Payout ratio</span>
                <span className="tabular-nums">{((netSettlement / Math.max(1, grossVolume)) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(netSettlement / Math.max(1, grossVolume)) * 100} accent="#00D66F" />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface/60 p-3 text-xs">
              <Banknote className="h-4 w-4 text-info" />
              <div>
                <p className="text-secondary">Next settlement</p>
                <p className="font-semibold">{formatDate('2026-07-05')} · T+1 ACH</p>
              </div>
            </div>
          </div>
        </div>

        {/* disputes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Chargebacks &amp; Disputes</h2>
            <span className="text-xs text-muted">{formatCurrency(disputes.reduce((s, d) => s + d.amount, 0))} at risk</span>
          </div>
          <DataTable columns={disputeColumns} rows={disputes} />
        </section>
      </div>
    </AdminPage>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <span className={`tabular-nums font-semibold ${tone ?? ''}`}>{value}</span>
    </div>
  );
}
