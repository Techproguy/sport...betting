import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="grid-radial absolute inset-0 opacity-40" />
      <div className="absolute -top-20 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
      <div className="relative">
        <Logo href="/" />
        <p className="mt-10 text-7xl font-extrabold tracking-tight text-gradient">404</p>
        <h1 className="mt-3 text-2xl font-bold">This market doesn&apos;t exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-secondary">
          The page you&apos;re looking for was settled, voided, or never opened. Let&apos;s get you back in the game.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_rgba(0,214,111,0.6)] hover:brightness-110"
          >
            Back to Home
          </Link>
          <Link
            href="/sports"
            className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground hover:border-primary"
          >
            Browse Sports
          </Link>
        </div>
      </div>
    </div>
  );
}
