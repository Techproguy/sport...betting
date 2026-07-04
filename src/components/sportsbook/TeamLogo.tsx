import { cn } from '@/lib/utils';
import type { Team } from '@/lib/types';

export function TeamLogo({ team, size = 40, className }: { team: Team; size?: number; className?: string }) {
  return (
    <div
      className={cn('flex flex-shrink-0 items-center justify-center rounded-lg font-bold text-white', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${team.color}, ${team.color}99)`,
        fontSize: size * 0.32,
        boxShadow: `0 4px 14px -6px ${team.color}`,
      }}
    >
      {team.logo}
    </div>
  );
}
