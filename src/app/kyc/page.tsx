import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { KycWizard } from '@/components/kyc/KycWizard';

export const metadata = {
  title: 'Identity Verification · Technoestro',
  description: 'Verify your identity to unlock deposits, betting, and withdrawals.',
};

export default function KycPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="grid-radial pointer-events-none absolute inset-0 opacity-30" />
      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <Logo />
        <Link href="/dashboard" className="text-sm text-secondary hover:text-foreground">
          Save &amp; exit
        </Link>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <KycWizard />
        <p className="mt-8 text-center text-xs text-muted">
          Your information is encrypted in transit and at rest. 21+ · Gamble responsibly.
        </p>
      </main>
    </div>
  );
}
