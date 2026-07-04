'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Progress } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { toast } from '@/store/toast';

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const passed = RULES.filter((r) => r.test(password)).length;
  const strengthPct = (passed / RULES.length) * 100;
  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][passed];
  const strengthAccent = ['#FF4D4F', '#FF4D4F', '#FFC107', '#3B82F6', '#00D66F'][passed];

  const pwError = touched && passed < 4 ? 'Password does not meet all requirements' : '';
  const matchError = touched && confirm.length > 0 && confirm !== password ? 'Passwords do not match' : '';
  const valid = passed === 4 && confirm === password;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    setDone(true);
    toast.success('Password updated', 'You can now sign in with your new password.');
  }

  if (done) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/12 text-success">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">Password updated</h2>
        <p className="mt-2 text-sm text-secondary">
          Your password has been changed successfully. Sign in with your new credentials to continue.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push('/login')}>
          Continue to sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Set a new password</h2>
        <p className="mt-1 text-sm text-secondary">
          Choose a strong password you haven&apos;t used before on this account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="password">New password</Label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={cn('pl-10 pr-10', pwError && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20')}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="Toggle password visibility">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password && (
            <div className="mt-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted">Password strength</span>
                <span className="text-xs font-semibold" style={{ color: strengthAccent }}>{strengthLabel}</span>
              </div>
              <Progress value={strengthPct} accent={strengthAccent} />
              <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {RULES.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li key={r.label} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-success' : 'text-muted')}>
                      {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {pwError && <p className="mt-1.5 text-xs font-medium text-danger">{pwError}</p>}
        </div>

        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={cn('pl-10', matchError && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20', !matchError && confirm && confirm === password && 'border-success/50 focus-visible:border-success')}
            />
          </div>
          {matchError ? (
            <p className="mt-1.5 text-xs font-medium text-danger">{matchError}</p>
          ) : confirm && confirm === password ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Passwords match
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {!loading && 'Update password'}
        </Button>
      </form>

      <Link href="/login" className="mt-8 block text-center text-sm font-medium text-secondary hover:text-foreground">
        Back to sign in
      </Link>
    </div>
  );
}
