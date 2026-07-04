import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = '/' }: { className?: string; href?: string | null }) {
  const inner = (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_rgba(0,214,111,0.8)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M4 14l5-9 3 5 3-6 5 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="18" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Techno<span className="text-primary">estro</span>
      </span>
    </span>
  );
  if (href === null) return inner;
  return <Link href={href}>{inner}</Link>;
}
