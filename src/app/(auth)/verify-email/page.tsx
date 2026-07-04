'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailOpen, RotateCw, ArrowRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/store/toast';

const RESEND_SECONDS = 45;
const EMAIL = 'alex.morgan@gmail.com';

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const shown = user.slice(0, 2);
  return `${shown}${'•'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [cooldown, setCooldown] = React.useState(RESEND_SECONDS);
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function resend() {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    toast.info('Verification email resent', `A new link is on its way to ${maskEmail(EMAIL)}.`);
  }

  async function verified() {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1000));
    setChecking(false);
    toast.success('Email verified', 'Your email address is confirmed.');
    router.push('/verify-phone');
  }

  return (
    <div className="animate-fade-up text-center">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />
        <span className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <MailOpen className="h-8 w-8" />
        </div>
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight">Verify your email</h2>
      <p className="mt-2 text-sm text-secondary">
        We sent a verification link to
        <br />
        <span className="font-semibold text-foreground">{maskEmail(EMAIL)}</span>
      </p>
      <p className="mt-1 text-sm text-secondary">Click the link in that email to activate your account.</p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left">
        <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <p className="text-sm text-secondary">
          Can&apos;t find it? Check your spam or promotions folder. Links expire 30 minutes after they&apos;re sent.
        </p>
      </div>

      <Button size="lg" className="mt-6 w-full" loading={checking} onClick={verified}>
        {!checking && (
          <>
            I&apos;ve verified my email <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <Button variant="secondary" size="lg" className="mt-2.5 w-full" onClick={resend} disabled={cooldown > 0}>
        <RotateCw className="h-4 w-4" />
        {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
      </Button>

      <p className="mt-8 text-center text-sm text-secondary">
        Wrong address?{' '}
        <Link href="/register" className="font-semibold text-primary hover:brightness-110">
          Update your email
        </Link>
      </p>
    </div>
  );
}
