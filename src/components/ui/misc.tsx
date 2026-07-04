'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = '#00D66F',
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: LucideIcon;
  accent?: string;
  sub?: string;
}) {
  const positive = delta ? !delta.startsWith('-') : true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: `${accent}1f`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {delta && (
        <p className={cn('mt-3 text-xs font-semibold', positive ? 'text-success' : 'text-danger')}>
          {delta} <span className="font-normal text-muted">vs last period</span>
        </p>
      )}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-elevated">
        <Icon className="h-7 w-7 text-muted" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Progress({ value, className, accent = '#00D66F' }: { value: number; className?: string; accent?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-elevated', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: accent }}
      />
    </div>
  );
}

export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      {label && <span className="text-xs uppercase tracking-wide text-muted">{label}</span>}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-elevated'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', checked ? 'left-[22px]' : 'left-0.5')}
      />
    </button>
  );
}
