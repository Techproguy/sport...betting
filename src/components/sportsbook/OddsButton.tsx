'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatOdds } from '@/lib/utils';
import { useBetSlip, type Selection } from '@/store/betSlip';

interface OddsButtonProps {
  selection: Selection;
  sub?: string; // e.g. spread line "-3.5"
  trend?: 'up' | 'down' | 'flat';
  compact?: boolean;
}

export function OddsButton({ selection, sub, trend, compact }: OddsButtonProps) {
  const { selections, toggle } = useBetSlip();
  const active = selections.some((s) => s.id === selection.id);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => toggle(selection)}
      className={cn(
        'group relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-md border px-2 transition-all',
        compact ? 'py-1.5' : 'py-2.5',
        active
          ? 'border-primary bg-primary/12 text-primary'
          : 'border-border bg-surface hover:border-primary/50 hover:bg-elevated'
      )}
    >
      {sub && <span className="truncate text-[11px] text-secondary">{sub}</span>}
      <span className={cn('flex items-center gap-1 font-bold tabular-nums', compact ? 'text-sm' : 'text-[15px]')}>
        {formatOdds(selection.odds)}
        {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-danger" />}
      </span>
    </motion.button>
  );
}
