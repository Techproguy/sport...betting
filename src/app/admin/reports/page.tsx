'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Ticket, ArrowDownToLine, ArrowUpFromLine, Trophy, UserPlus, Repeat,
  ShieldCheck, Calendar, Download, Play, FileText, type LucideIcon,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { AreaTrend, Bars } from '@/components/charts/Charts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { formatCurrency, formatCompact, formatNumber, timeAgo, formatDate } from '@/lib/utils';

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function delta(seed: string) {
  const h = hash(seed);
  const up = h % 3 !== 0;
  const v = (((h % 170) / 10) + 1.3).toFixed(1);
  return { label: `${up ? '+' : '-'}${v}%`, up };
}

const PALETTE = ['#00D66F', '#3B82F6', '#FFC107', '#FF4D4F', '#A855F7', '#22D3EE', '#EC4899', '#FB923C'];

type ReportCard = {
  key: string;
  title: string;
  icon: LucideIcon;
  metric: string;
  sub: string;
  color: string;
  chart: React.ReactNode;
};

type Scheduled = {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  format: string;
  recipients: string;
  nextRun: string;
  status: 'active' | 'inactive';
};

type Recent = {
  id: string;
  name: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  at: string;
  size: string;
};

const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to date', 'Custom'];
const FORMATS = [
  { value: 'PDF', label: 'PDF' },
  { value: 'CSV', label: 'CSV' },
  { value: 'XLSX', label: 'XLSX' },
];

const SCHEDULED: Scheduled[] = [
  { id: 'sr_1', name: 'Daily Revenue Summary', frequency: 'Daily', format: 'PDF', recipients: 'Finance team', nextRun: '2026-07-05T06:00:00Z', status: 'active' },
  { id: 'sr_2', name: 'Weekly Bet Volume', frequency: 'Weekly', format: 'XLSX', recipients: '8 recipients', nextRun: '2026-07-07T07:00:00Z', status: 'active' },
  { id: 'sr_3', name: 'Monthly Compliance Filing', frequency: 'Monthly', format: 'PDF', recipients: 'Compliance team', nextRun: '2026-08-01T09:00:00Z', status: 'active' },
  { id: 'sr_4', name: 'Withdrawals Reconciliation', frequency: 'Daily', format: 'CSV', recipients: '4 recipients', nextRun: '2026-07-05T05:30:00Z', status: 'inactive' },
  { id: 'sr_5', name: 'VIP Retention Report', frequency: 'Weekly', format: 'PDF', recipients: 'Marketing team', nextRun: '2026-07-08T08:00:00Z', status: 'active' },
];

const RECENT: Recent[] = [
  { id: 'rg_1', name: 'Revenue — Q2 2026', format: 'PDF', at: '2026-07-04T08:12:00Z', size: '2.4 MB' },
  { id: 'rg_2', name: 'Bet Volume — June', format: 'XLSX', at: '2026-07-04T06:40:00Z', size: '5.1 MB' },
  { id: 'rg_3', name: 'Deposits Ledger', format: 'CSV', at: '2026-07-03T21:05:00Z', size: '1.2 MB' },
  { id: 'rg_4', name: 'Regulatory Filing NJ', format: 'PDF', at: '2026-07-03T14:22:00Z', size: '3.8 MB' },
  { id: 'rg_5', name: 'Player Retention Cohorts', format: 'XLSX', at: '2026-07-02T18:47:00Z', size: '4.3 MB' },
  { id: 'rg_6', name: 'Sports Performance Breakdown', format: 'CSV', at: '2026-07-02T09:30:00Z', size: '0.9 MB' },
];

const FORMAT_BADGE: Record<Recent['format'], 'danger' | 'info' | 'success'> = {
  PDF: 'danger',
  CSV: 'info',
  XLSX: 'success',
};

export default function AdminReportsPage() {
  const { bets, users, kyc, fraud, series } = db();

  const [range, setRange] = useState('Last 30 days');
  const [format, setFormat] = useState('PDF');

  const cards = useMemo<ReportCard[]>(() => {
    const revenueTotal = series.revenue.reduce((a, r) => a + r.revenue, 0);
    const handleTotal = series.revenue.reduce((a, r) => a + r.handle, 0);
    const depositTotal = series.daily.reduce((a, d) => a + d.deposits, 0);
    const withdrawalTotal = series.daily.reduce((a, d) => a + d.withdrawals, 0);
    const newUsers = series.revenue.reduce((a, r) => a + r.users, 0);
    const volumeTotal = series.sportVolume.reduce((a, s) => a + s.volume, 0);
    const topSport = [...series.sportVolume].sort((a, b) => b.volume - a.volume)[0];
    const activeRate = Math.round((users.filter((u) => u.status === 'active').length / users.length) * 100);
    const approvedKyc = kyc.filter((k) => k.status === 'approved').length;
    const openFraud = fraud.filter((f) => f.status === 'open' || f.status === 'investigating').length;

    const revData = series.revenue.map((r) => ({ month: r.month, v: r.revenue }));
    const acqData = series.revenue.map((r) => ({ month: r.month, v: r.users }));
    const depData = series.daily.map((d) => ({ day: d.day, v: d.deposits }));
    const wdData = series.daily.map((d) => ({ day: d.day, v: d.withdrawals }));
    const betData = series.hourly.map((h) => ({ hour: h.hour, v: h.bets }));
    const retData = series.daily.map((d) => ({ day: d.day, v: d.bets }));
    const volData = series.sportVolume.map((s) => ({ sport: s.sport, v: s.volume }));
    const compData = series.revenue.map((r) => ({ month: r.month, v: r.ggr }));

    const H = 70;
    return [
      {
        key: 'revenue', title: 'Revenue', icon: DollarSign, color: PALETTE[0],
        metric: formatCurrency(revenueTotal), sub: `${formatCompact(handleTotal)} handle`,
        chart: <AreaTrend data={revData} x="month" y="v" color={PALETTE[0]} height={H} format={formatCompact} />,
      },
      {
        key: 'volume', title: 'Bet Volume', icon: Ticket, color: PALETTE[1],
        metric: formatNumber(bets.length), sub: `${formatCompact(handleTotal)} wagered`,
        chart: <Bars data={betData} x="hour" y="v" color={PALETTE[1]} height={H} />,
      },
      {
        key: 'deposits', title: 'Deposits', icon: ArrowDownToLine, color: PALETTE[0],
        metric: formatCurrency(depositTotal), sub: 'Last 30 days',
        chart: <AreaTrend data={depData} x="day" y="v" color={PALETTE[0]} height={H} format={formatCompact} />,
      },
      {
        key: 'withdrawals', title: 'Withdrawals', icon: ArrowUpFromLine, color: PALETTE[3],
        metric: formatCurrency(withdrawalTotal), sub: 'Last 30 days',
        chart: <AreaTrend data={wdData} x="day" y="v" color={PALETTE[3]} height={H} format={formatCompact} />,
      },
      {
        key: 'sports', title: 'Sports Performance', icon: Trophy, color: PALETTE[4],
        metric: formatCompact(volumeTotal), sub: `${topSport?.sport ?? '—'} leads`,
        chart: <Bars data={volData} x="sport" y="v" color={PALETTE[4]} height={H} format={formatCompact} />,
      },
      {
        key: 'acquisition', title: 'Customer Acquisition', icon: UserPlus, color: PALETTE[5],
        metric: formatNumber(newUsers), sub: 'New sign-ups',
        chart: <AreaTrend data={acqData} x="month" y="v" color={PALETTE[5]} height={H} />,
      },
      {
        key: 'retention', title: 'Player Retention', icon: Repeat, color: PALETTE[6],
        metric: `${activeRate}%`, sub: '30-day active rate',
        chart: <Bars data={retData} x="day" y="v" color={PALETTE[6]} height={H} format={formatCompact} />,
      },
      {
        key: 'compliance', title: 'Regulatory / Compliance', icon: ShieldCheck, color: PALETTE[2],
        metric: `${approvedKyc}/${kyc.length}`, sub: `${openFraud} open cases`,
        chart: <AreaTrend data={compData} x="month" y="v" color={PALETTE[2]} height={H} format={formatCompact} />,
      },
    ];
  }, [bets.length, users, kyc, fraud, series]);

  const scheduledColumns: Column<Scheduled>[] = [
    { key: 'name', header: 'Report', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'frequency', header: 'Frequency', render: (r) => <span className="text-secondary">{r.frequency}</span> },
    { key: 'format', header: 'Format', render: (r) => <span className="text-xs font-semibold text-secondary">{r.format}</span> },
    { key: 'recipients', header: 'Recipients', render: (r) => <span className="text-xs text-muted">{r.recipients}</span> },
    { key: 'nextRun', header: 'Next Run', render: (r) => <span className="text-xs tabular-nums text-secondary">{formatDate(r.nextRun)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <Button
          variant="ghost" size="sm" className="h-8"
          onClick={(e) => { e.stopPropagation(); toast.success('Report queued', `${r.name} · running now`); }}
        >
          <Play className="h-3.5 w-3.5" />Run now
        </Button>
      ),
    },
  ];

  return (
    <AdminPage title="Reports">
      {/* Selector bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-2 z-10 flex flex-col gap-3 rounded-lg border border-border bg-card/95 p-3 backdrop-blur md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="pl-9 sm:w-48">
              {RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <Tabs tabs={FORMATS} value={format} onChange={setFormat} className="w-full sm:w-auto" />
        </div>
        <Button
          variant="primary" size="sm"
          onClick={() => toast.success('Report exported', `All reports · ${range} · ${format}`)}
        >
          <Download className="h-4 w-4" />Export all
        </Button>
      </motion.div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const d = delta(c.key + range);
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex flex-col rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${c.color}1A`, color: c.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={d.up ? 'text-xs font-semibold tabular-nums text-success' : 'text-xs font-semibold tabular-nums text-danger'}>
                  {d.label}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-muted">{c.title}</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{c.metric}</p>
              <p className="text-[11px] text-muted">{c.sub}</p>
              <div className="mt-2">{c.chart}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary" size="sm"
                  onClick={() => toast.info('Generating…', `${c.title} · ${format}`)}
                >
                  <FileText className="h-3.5 w-3.5" />Generate
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => toast.success('Report exported', `${c.title} · ${format}`)}
                >
                  <Download className="h-3.5 w-3.5" />Export
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scheduled reports */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Scheduled reports</h3>
          <span className="text-xs text-muted">{SCHEDULED.filter((s) => s.status === 'active').length} active schedules</span>
        </div>
        <DataTable columns={scheduledColumns} rows={SCHEDULED} empty="No scheduled reports." />
      </motion.div>

      {/* Recently generated */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
        <h3 className="text-sm font-semibold">Recently generated</h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {RECENT.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-[11px] text-muted">{timeAgo(r.at)} · {r.size}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={FORMAT_BADGE[r.format]}>{r.format}</Badge>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => toast.success('Downloaded', r.name)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminPage>
  );
}
