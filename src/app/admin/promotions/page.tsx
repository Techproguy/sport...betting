'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Copy, Trash2, Users, TrendingUp, Sparkles } from 'lucide-react';
import { AdminPage } from '@/components/admin/AdminPage';
import { DataTable, StatusPill, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Switch } from '@/components/ui/misc';
import { toast } from '@/store/toast';
import { db } from '@/lib/mock/db';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import type { Promotion } from '@/lib/types';

// ---------------- types ----------------
interface PromoRow extends Promotion {
  active: boolean;
  type: string;
  startDate: string;
  endDate: string;
}

const PROMO_TYPES: { label: string; tag: string; color: string }[] = [
  { label: 'Welcome', tag: 'WELCOME', color: '#00D66F' },
  { label: 'Deposit Match', tag: 'DEPOSIT', color: '#3B82F6' },
  { label: 'Odds Boost', tag: 'BOOST', color: '#FFC107' },
  { label: 'Free Bet', tag: 'FREE BET', color: '#22D3EE' },
  { label: 'Referral', tag: 'REFERRAL', color: '#EC4899' },
  { label: 'Parlay Insurance', tag: 'PARLAY', color: '#A855F7' },
];

function typeForTag(tag: string): string {
  return PROMO_TYPES.find((t) => t.tag === tag)?.label ?? 'Welcome';
}
function metaForType(label: string): { tag: string; color: string } {
  const t = PROMO_TYPES.find((x) => x.label === label) ?? PROMO_TYPES[0];
  return { tag: t.tag, color: t.color };
}

// ---------------- deterministic stats ----------------
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function statsFor(id: string, index: number) {
  const h = hash(`${id}:${index}`);
  const optIns = 620 + (h % 11800);
  const cost = 4500 + (h % 42000);
  const revenue = Math.round(cost * (0.55 + ((h >> 4) % 240) / 100));
  const roi = (revenue - cost) / cost;
  return { optIns, cost, revenue, roi };
}

// ---------------- seed ----------------
function seedRows(): PromoRow[] {
  return db().promotions.map((p) => ({
    ...p,
    active: p.featured,
    type: typeForTag(p.tag),
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  }));
}

const emptyForm = {
  title: '',
  type: 'Welcome',
  value: '',
  startDate: '',
  endDate: '',
  terms: '21+. Terms apply. Available in eligible states. Gambling problem? Call 1-800-GAMBLER.',
};

export default function PromotionsPage() {
  const [rows, setRows] = React.useState<PromoRow[]>(seedRows);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);

  const preview = metaForType(form.type);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: PromoRow) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      type: p.type,
      value: p.value,
      startDate: p.startDate,
      endDate: p.endDate,
      terms: p.terms,
    });
    setOpen(true);
  }

  function submitForm() {
    if (!form.title.trim()) {
      toast.error('Title required', 'Give the promotion a name before saving.');
      return;
    }
    const meta = metaForType(form.type);
    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                title: form.title.trim(),
                type: form.type,
                tag: meta.tag,
                color: meta.color,
                value: form.value || r.value,
                startDate: form.startDate,
                endDate: form.endDate,
                terms: form.terms,
              }
            : r
        )
      );
      toast.success('Promotion updated', form.title.trim());
    } else {
      const id = `promo_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
      const row: PromoRow = {
        id,
        title: form.title.trim(),
        subtitle: `${form.type} offer`,
        tag: meta.tag,
        color: meta.color,
        cta: 'Claim Offer',
        terms: form.terms,
        value: form.value || 'TBD',
        featured: false,
        active: true,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      setRows((prev) => [row, ...prev]);
      toast.success('Promotion created', form.title.trim());
    }
    setOpen(false);
  }

  function toggleActive(id: string, next: boolean) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: next } : r)));
    const p = rows.find((r) => r.id === id);
    if (next) toast.success('Promotion activated', p?.title);
    else toast.info('Promotion paused', p?.title);
  }

  function duplicate(p: PromoRow) {
    const id = `promo_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === p.id);
      const copy: PromoRow = { ...p, id, title: `${p.title} (Copy)`, featured: false, active: false };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    toast.success('Promotion duplicated', p.title);
  }

  function remove(p: PromoRow) {
    setRows((prev) => prev.filter((r) => r.id !== p.id));
    toast.info('Promotion deleted', p.title);
  }

  const columns: Column<PromoRow>[] = [
    { key: 'title', header: 'Promotion', render: (r) => <span className="font-medium">{r.title}</span> },
    {
      key: 'tag',
      header: 'Tag',
      render: (r) => (
        <span
          className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: `${r.color}1f`, color: r.color }}
        >
          {r.tag}
        </span>
      ),
    },
    {
      key: 'optins',
      header: 'Opt-ins',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatNumber(statsFor(r.id, 0).optIns)}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      align: 'right',
      render: (r) => <span className="tabular-nums text-secondary">{formatCurrency(statsFor(r.id, 0).cost)}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (r) => <span className="tabular-nums">{formatCurrency(statsFor(r.id, 0).revenue)}</span>,
    },
    {
      key: 'roi',
      header: 'ROI',
      align: 'right',
      render: (r) => {
        const roi = statsFor(r.id, 0).roi;
        return (
          <span className={cn('font-semibold tabular-nums', roi >= 0 ? 'text-success' : 'text-danger')}>
            {roi >= 0 ? '+' : ''}
            {(roi * 100).toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => <StatusPill status={r.active ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <AdminPage
      title="Promotions"
      action={
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create promotion
        </Button>
      }
    >
      <div className="space-y-8">
        {/* cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((p, i) => {
            const s = statsFor(p.id, i);
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-5"
              >
                {/* top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: p.color }} />
                {/* glow */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40"
                  style={{ background: p.color }}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
                    style={{ background: `${p.color}1f`, color: p.color }}
                  >
                    {p.tag}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[11px] font-medium', p.active ? 'text-success' : 'text-muted')}>
                      {p.active ? 'Active' : 'Paused'}
                    </span>
                    <Switch checked={p.active} onChange={(v) => toggleActive(p.id, v)} />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-1 text-sm text-secondary">{p.subtitle}</p>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: p.color }}>
                    {p.value}
                  </span>
                  <span className="text-xs text-muted">{p.type}</span>
                </div>

                {/* stats */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-surface/60 p-3">
                  <Stat label="Opt-ins" value={formatNumber(s.optIns)} />
                  <Stat
                    label="ROI"
                    value={`${s.roi >= 0 ? '+' : ''}${(s.roi * 100).toFixed(1)}%`}
                    valueClass={s.roi >= 0 ? 'text-success' : 'text-danger'}
                  />
                  <Stat label="Cost" value={formatCurrency(s.cost)} />
                  <Stat label="Revenue" value={formatCurrency(s.revenue)} />
                </div>

                {/* actions */}
                <div className="mt-4 flex items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Duplicate" onClick={() => duplicate(p)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(p)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* performance table */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">Performance</h2>
          </div>
          <DataTable columns={columns} rows={rows} onRowClick={(r) => openEdit(r)} empty="No promotions yet." />
        </div>
      </div>

      {/* create / edit modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-surface p-6 no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{editingId ? 'Edit promotion' : 'Create promotion'}</h2>
                  </div>
                  <Button size="icon" variant="ghost" aria-label="Close" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* form */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="p-title">Title</Label>
                      <Input
                        id="p-title"
                        placeholder="Bet $5, Get $200 in Bonus Bets"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-type">Type</Label>
                      <Select
                        id="p-type"
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      >
                        {PROMO_TYPES.map((t) => (
                          <option key={t.label} value={t.label}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-value">Value</Label>
                      <Input
                        id="p-value"
                        placeholder="$200 or +40%"
                        value={form.value}
                        onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="p-start">Start date</Label>
                        <Input
                          id="p-start"
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="p-end">End date</Label>
                        <Input
                          id="p-end"
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-terms">Terms</Label>
                      <textarea
                        id="p-terms"
                        rows={3}
                        value={form.terms}
                        onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
                        className="flex w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* live preview */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live preview</p>
                    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
                      <div className="absolute inset-x-0 top-0 h-1" style={{ background: preview.color }} />
                      <div
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-3xl"
                        style={{ background: preview.color }}
                      />
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
                        style={{ background: `${preview.color}1f`, color: preview.color }}
                      >
                        {preview.tag}
                      </span>
                      <h3 className="mt-3 text-base font-semibold leading-snug">
                        {form.title || 'Your promotion title'}
                      </h3>
                      <p className="mt-1 text-sm text-secondary">{form.type} offer</p>
                      <div className="mt-3 text-2xl font-bold tabular-nums" style={{ color: preview.color }}>
                        {form.value || '—'}
                      </div>
                      <div
                        className="mt-4 inline-flex rounded-md px-3 py-1.5 text-xs font-semibold"
                        style={{ background: preview.color, color: '#0A0A0A' }}
                      >
                        Claim Offer
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-muted">{form.terms}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitForm}>
                    {editingId ? (
                      <>
                        <Pencil className="h-4 w-4" /> Save changes
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Create
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        {label === 'Opt-ins' && <Users className="h-3 w-3" />}
        {label}
      </p>
      <p className={cn('mt-0.5 text-sm font-semibold tabular-nums', valueClass)}>{value}</p>
    </div>
  );
}
