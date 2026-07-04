import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { ShieldCheck, Lock } from 'lucide-react';

const COLS = [
  { title: 'Sportsbook', links: ['NFL', 'NBA', 'MLB', 'Soccer', 'Live Betting', 'Same Game Parlay'] },
  { title: 'Account', links: ['My Bets', 'Wallet', 'Deposit', 'Withdraw', 'Responsible Gambling', 'Settings'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Partners', 'Affiliates', 'Contact'] },
  { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'State Licenses', 'AML Policy'] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1600px] px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-secondary">
              Technoestro Solutions — the next-generation sportsbook built for speed, trust, and the modern bettor.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Licensed & Regulated
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-secondary">
                <Lock className="h-3.5 w-3.5 text-primary" /> 256-bit SSL
              </span>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="mb-3 text-sm font-semibold">{c.title}</p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-secondary transition-colors hover:text-primary">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex h-8 items-center gap-1.5 rounded-md bg-elevated px-2.5 font-bold text-foreground">21+</span>
            <span>Gambling problem? Call 1-800-GAMBLER.</span>
          </div>
          <p className="text-xs text-muted">
            © 2026 Technoestro Solutions. Demo product for investor presentation. Not a real-money operator.
          </p>
        </div>
      </div>
    </footer>
  );
}
