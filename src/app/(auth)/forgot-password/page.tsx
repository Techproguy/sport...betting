'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, MailCheck, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { toast } from '@/store/toast';

const RESEND_SECONDS = 45;

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const emailError = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '';

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    setCooldown(RESEND_SECONDS);
    toast.success('Reset link sent', `Check ${email} for instructions.`);
  }

  function resend() {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    toast.info('Reset link resent', `We sent another link to ${email}.`);
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <MailCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-secondary">
          We sent a password reset link to{' '}
          <span className="font-semibold text-foreground">{email}</span>. The link expires in 30 minutes.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-left text-sm text-secondary">
          Didn&apos;t get it? Check your spam folder, or confirm the address is correct before requesting another link.
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="mt-6 w-full"
          onClick={resend}
          disabled={cooldown > 0}
        >
          <RotateCw className="h-4 w-4" />
          {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend email'}
        </Button>

        <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Forgot your password?</h2>
        <p className="mt-1 text-sm text-secondary">
          Enter the email tied to your account and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={emailError ? 'pl-10 border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'pl-10'}
            />
          </div>
          {emailError && <p className="mt-1.5 text-xs font-medium text-danger">{emailError}</p>}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {!loading && 'Send reset link'}
        </Button>
      </form>

      <Link href="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
