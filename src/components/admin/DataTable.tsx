'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center'
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-secondary">
                  {empty ?? 'No records found.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border/60 transition-colors hover:bg-elevated/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 py-3 align-middle',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.className
                      )}
                    >
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-success/12 text-success',
    approved: 'bg-success/12 text-success',
    completed: 'bg-success/12 text-success',
    won: 'bg-success/12 text-success',
    resolved: 'bg-success/12 text-success',
    pending: 'bg-warning/12 text-warning',
    processing: 'bg-info/12 text-info',
    investigating: 'bg-info/12 text-info',
    restricted: 'bg-warning/12 text-warning',
    suspended: 'bg-warning/12 text-warning',
    open: 'bg-warning/12 text-warning',
    cashout: 'bg-info/12 text-info',
    lost: 'bg-danger/12 text-danger',
    failed: 'bg-danger/12 text-danger',
    rejected: 'bg-danger/12 text-danger',
    banned: 'bg-danger/12 text-danger',
    escalated: 'bg-danger/12 text-danger',
    void: 'bg-muted/20 text-muted',
    not_started: 'bg-muted/20 text-muted',
    inactive: 'bg-muted/20 text-muted',
  };
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', map[status] ?? 'bg-elevated text-secondary')}>
      {status.replace('_', ' ')}
    </span>
  );
}

export function SeverityPill({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: 'bg-info/12 text-info',
    medium: 'bg-warning/12 text-warning',
    high: 'bg-danger/12 text-danger',
    critical: 'bg-danger/20 text-danger',
  };
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', map[level])}>
      {level}
    </span>
  );
}
