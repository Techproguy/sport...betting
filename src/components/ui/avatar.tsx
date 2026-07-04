import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';

export function Avatar({ name, className, color }: { name: string; className?: string; color?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-xs font-bold text-white ring-1 ring-white/10',
        className
      )}
      style={{ background: color ?? 'linear-gradient(135deg,#00D66F,#0891b2)' }}
    >
      {initials(name)}
    </div>
  );
}
