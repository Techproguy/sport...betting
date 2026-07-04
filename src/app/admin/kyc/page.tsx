'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileCheck, CheckCircle2, XCircle, Clock, X, Check, AlertTriangle, IdCard, ScanFace, Flag,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { StatCard } from '@/components/ui/misc';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { timeAgo, formatDateTime } from '@/lib/utils';
import type { KycSubmission, KycStatus } from '@/lib/types';

function KycDrawer({ sub, onClose, onDecision }: {
  sub: KycSubmission; onClose: () => void; onDecision: (id: string, status: KycStatus) => void;
}) {
  const { users } = db();
  const user = users.find((u) => u.id === sub.userId);
  const fields: [string, string][] = [
    ['Full name', sub.userName],
    ['Document', sub.documentType],
    ['Country', sub.country],
    ['Date of birth', 'Mar 14, 1991'],
    ['Document no.', `D${sub.id.replace(/\D/g, '')}47821`],
    ['Expiry', 'Aug 2029'],
    ['Address', `${user?.state ?? 'NJ'}, United States`],
    ['Submitted', formatDateTime(sub.submittedAt)],
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Avatar name={sub.userName} className="h-9 w-9" />
            <div>
              <p className="text-sm font-semibold">{sub.userName}</p>
              <p className="text-xs text-muted">{sub.id} · {sub.documentType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <StatusPill status={sub.status} />
            <span className="text-xs text-muted">Submitted {timeAgo(sub.submittedAt)}</span>
          </div>

          {/* Document previews */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Identity Document</p>
            <div className="grid grid-cols-2 gap-3">
              {['Front', 'Back'].map((side) => (
                <div key={side} className="relative aspect-[1.58] overflow-hidden rounded-lg border border-border bg-gradient-to-br from-elevated to-card">
                  <div className="absolute inset-0 grid-radial opacity-60" />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 text-[11px] text-secondary"><IdCard className="h-3.5 w-3.5" />{side}</div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="h-1.5 w-2/3 rounded bg-white/20" />
                    <div className="mt-1.5 h-1.5 w-1/2 rounded bg-white/10" />
                  </div>
                  <div className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          {/* Selfie */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Liveness Selfie</p>
            <div className="relative flex aspect-[2.2] items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-elevated to-card">
              <div className="absolute inset-0 grid-radial opacity-50" />
              <ScanFace className="h-12 w-12 text-muted" />
              <span className="absolute bottom-2 right-3 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Face match 96%</span>
            </div>
          </div>

          {/* Extracted data */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Extracted Data</p>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {fields.map(([l, v]) => (
                <div key={l} className="bg-card p-3">
                  <p className="text-[11px] text-muted">{l}</p>
                  <p className="mt-0.5 truncate text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk flags */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Risk Flags</p>
            {sub.riskFlags.length === 0 ? (
              <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/8 px-3 py-2 text-xs text-success">
                <CheckCircle2 className="h-4 w-4" />No risk flags detected.
              </p>
            ) : (
              <div className="space-y-1.5">
                {sub.riskFlags.map((f) => (
                  <p key={f} className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-warning">
                    <AlertTriangle className="h-4 w-4" />{f}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
          <Button variant="danger" onClick={() => { onDecision(sub.id, 'rejected'); toast.error('KYC rejected', sub.userName); onClose(); }}>
            <XCircle className="h-4 w-4" />Reject
          </Button>
          <Button variant="primary" onClick={() => { onDecision(sub.id, 'approved'); toast.success('KYC approved', sub.userName); onClose(); }}>
            <Check className="h-4 w-4" />Approve
          </Button>
        </div>
      </motion.div>
    </>
  );
}

export default function AdminKycPage() {
  const [items, setItems] = useState<KycSubmission[]>(() => db().kyc);
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<KycSubmission | null>(null);

  const onDecision = (id: string, status: KycStatus) =>
    setItems((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));

  const counts = useMemo(() => ({
    pending: items.filter((k) => k.status === 'pending').length,
    approved: items.filter((k) => k.status === 'approved').length,
    rejected: items.filter((k) => k.status === 'rejected').length,
  }), [items]);

  const filtered = tab === 'all' ? items : items.filter((k) => k.status === tab);

  const columns: Column<KycSubmission>[] = [
    {
      key: 'user', header: 'User',
      render: (k) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={k.userName} className="h-9 w-9" />
          <div><p className="font-medium">{k.userName}</p><p className="text-xs text-muted">{k.id}</p></div>
        </div>
      ),
    },
    { key: 'documentType', header: 'Document', render: (k) => <span className="text-secondary">{k.documentType}</span> },
    { key: 'country', header: 'Country', render: (k) => <span className="text-secondary">{k.country}</span> },
    { key: 'submitted', header: 'Submitted', render: (k) => <span className="text-xs text-muted">{timeAgo(k.submittedAt)}</span> },
    {
      key: 'flags', header: 'Risk Flags',
      render: (k) => k.riskFlags.length === 0 ? <span className="text-xs text-muted">—</span> : (
        <div className="flex flex-wrap gap-1">
          {k.riskFlags.map((f) => (
            <span key={f} className="rounded-full bg-warning/12 px-2 py-0.5 text-[10px] font-medium text-warning">{f}</span>
          ))}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (k) => <StatusPill status={k.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (k) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => { onDecision(k.id, 'approved'); toast.success('KYC approved', k.userName); }}><Check className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => { onDecision(k.id, 'rejected'); toast.error('KYC rejected', k.userName); }}><X className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="KYC Review">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending Review" value={`${counts.pending}`} icon={Clock} accent="#FFC107" sub="Awaiting decision" />
        <StatCard label="Approved Today" value={`${Math.max(3, Math.round(counts.approved * 0.3))}`} icon={CheckCircle2} accent="#00D66F" delta="+9%" />
        <StatCard label="Rejected" value={`${counts.rejected}`} icon={XCircle} accent="#FF4D4F" sub="Flagged submissions" />
        <StatCard label="Avg Review Time" value="6m 24s" icon={FileCheck} accent="#3B82F6" sub="Last 24 hours" />
      </div>

      <Tabs
        value={tab} onChange={setTab}
        tabs={[
          { value: 'all', label: `All (${items.length})` },
          { value: 'pending', label: `Pending (${counts.pending})`, icon: <Clock className="h-3.5 w-3.5" /> },
          { value: 'approved', label: `Approved (${counts.approved})`, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
          { value: 'rejected', label: `Rejected (${counts.rejected})`, icon: <Flag className="h-3.5 w-3.5" /> },
        ]}
      />

      <DataTable columns={columns} rows={filtered} onRowClick={setSelected} empty="No submissions in this queue." />

      <AnimatePresence>
        {selected && <KycDrawer key={selected.id} sub={selected} onClose={() => setSelected(null)} onDecision={onDecision} />}
      </AnimatePresence>
    </AdminPage>
  );
}
