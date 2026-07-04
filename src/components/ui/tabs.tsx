'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto no-scrollbar rounded-lg border border-border bg-surface p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'relative flex flex-shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
            value === t.value ? 'bg-elevated text-foreground' : 'text-secondary hover:text-foreground'
          )}
        >
          {value === t.value && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
          )}
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
