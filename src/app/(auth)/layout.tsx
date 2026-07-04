import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { ShieldCheck, Zap, Trophy } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-gradient-to-br from-[#06120c] via-background to-background lg:flex">
        <div className="grid-radial absolute inset-0 opacity-40" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Logo />
          <div>
            <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
              The sportsbook built for <span className="text-primary">winners.</span>
            </h1>
            <p className="mt-4 max-w-sm text-secondary">
              Join 2.4M+ bettors. Premium odds, lightning-fast payouts, and the deepest live markets in the game.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Zap, label: 'Instant deposits & same-day withdrawals' },
                { icon: Trophy, label: 'Boosted odds & same-game parlays daily' },
                { icon: ShieldCheck, label: 'Bank-grade security & licensed operation' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <f.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm text-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">© 2026 Technoestro Solutions · 21+ · Gamble responsibly</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link href="/" className="text-sm text-secondary hover:text-foreground">
            Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
