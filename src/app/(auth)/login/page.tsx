'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Divider, Switch } from '@/components/ui/misc';
import { toast } from '@/store/toast';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.07-1.91 3.25-4.72 3.25-8.08Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.06-3.74 1.06-2.87 0-5.3-1.94-6.17-4.55H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.65-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.14-3.14C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06L5.83 9.9C6.7 7.29 9.13 4.75 12 4.75Z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.36 12.65c-.02-2.05 1.67-3.03 1.75-3.08-.95-1.4-2.44-1.59-2.97-1.61-1.27-.13-2.47.74-3.11.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.03-1.43 2.49-.37 6.17 1.03 8.19.68 1 1.49 2.11 2.56 2.07 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.1-.02 1.8-1.01 2.48-2.01.78-1.16 1.1-2.28 1.12-2.34-.02-.01-2.15-.83-2.17-3.28ZM14.3 6.31c.56-.69.94-1.63.84-2.58-.81.03-1.8.54-2.38 1.22-.52.6-.98 1.57-.86 2.49.9.07 1.83-.46 2.4-1.13Z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const emailError = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '';
  const pwError = touched && password.length < 8 ? 'Password must be at least 8 characters' : '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    toast.success('Welcome back, Alex', 'Redirecting to your dashboard…');
    router.push('/dashboard');
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-sm text-secondary">Welcome back — your bets and balances are waiting.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? 'pl-10 border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'pl-10'}
            />
          </div>
          {emailError && <p className="mt-1.5 text-xs font-medium text-danger">{emailError}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:brightness-110">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={pwError ? 'pl-10 pr-10 border-danger focus-visible:border-danger focus-visible:ring-danger/20' : 'pl-10 pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pwError && <p className="mt-1.5 text-xs font-medium text-danger">{pwError}</p>}
        </div>

        <div className="flex items-center gap-2.5">
          <Switch checked={remember} onChange={setRemember} />
          <span className="text-sm text-secondary">Remember me for 30 days</span>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {!loading && (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6">
        <Divider label="or continue with" />
      </div>

      <div className="space-y-2.5">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => toast.info('Google sign-in', 'This is a demo — social auth is simulated.')}>
          <GoogleIcon className="h-5 w-5" /> Continue with Google
        </Button>
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="secondary" size="lg" onClick={() => toast.info('Apple sign-in', 'This is a demo — social auth is simulated.')}>
            <AppleIcon className="h-5 w-5" /> Apple
          </Button>
          <Button variant="secondary" size="lg" onClick={() => toast.info('Phone sign-in', 'We would text you a one-time code.')}>
            <Phone className="h-4 w-4" /> Phone
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-secondary">
        New to Technoestro?{' '}
        <Link href="/register" className="font-semibold text-primary hover:brightness-110">
          Create an account
        </Link>
      </p>
      <p className="mt-6 text-center text-xs text-muted">21+ · Gamble responsibly · Terms apply</p>
    </div>
  );
}
