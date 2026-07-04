import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-elevated text-secondary border-border',
  primary: 'bg-primary/12 text-primary border-primary/30',
  success: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning/12 text-warning border-warning/30',
  danger: 'bg-danger/12 text-danger border-danger/30',
  info: 'bg-info/12 text-info border-info/30',
  live: 'bg-danger/15 text-danger border-danger/40',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
