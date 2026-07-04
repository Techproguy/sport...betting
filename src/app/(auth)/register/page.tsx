'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Divider, Progress } from '@/components/ui/misc';
import { US_STATES } from '@/lib/mock/catalog';
import { cn } from '@/lib/utils';
import { toast } from '@/store/toast';

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

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

function isAdult(dob: string): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  return age >= 21;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    state: '',
    promo: '',
  });
  const [terms, setTerms] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passed = RULES.filter((r) => r.test(form.password)).length;
  const strengthPct = (passed / RULES.length) * 100;
  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][passed];
  const strengthAccent = ['#FF4D4F', '#FF4D4F', '#FFC107', '#3B82F6', '#00D66F'][passed];

  const errors = {
    name: touched && form.name.trim().length < 2 ? 'Enter your full name' : '',
    email: touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address' : '',
    phone: touched && form.phone.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number' : '',
    password: touched && passed < 4 ? 'Password does not meet all requirements' : '',
    dob: touched && !isAdult(form.dob) ? 'You must be at least 21 years old' : '',
    state: touched && !form.state ? 'Select your state' : '',
    terms: touched && !terms ? 'You must accept the terms' : '',
  };

  const valid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.replace(/\D/g, '').length >= 10 &&
    passed === 4 &&
    isAdult(form.dob) &&
    !!form.state &&
    terms;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success('Account created', "Let's verify your identity to unlock betting.");
    router.push('/kyc');
  }

  const errCls = (bad: string) =>
    bad ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/20' : '';

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="mt-1 text-sm text-secondary">Join 2.4M+ bettors. It takes under two minutes.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input id="name" placeholder="Alex Morgan" value={form.name} onChange={set('name')} className={cn('pl-10', errCls(errors.name))} autoComplete="name" />
          </div>
          {errors.name && <p className="mt-1.5 text-xs font-medium text-danger">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={cn('pl-10', errCls(errors.email))} autoComplete="email" />
          </div>
          {errors.email && <p className="mt-1.5 text-xs font-medium text-danger">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone number</Label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input id="phone" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={set('phone')} className={cn('pl-10', errCls(errors.phone))} autoComplete="tel" />
          </div>
          {errors.phone && <p className="mt-1.5 text-xs font-medium text-danger">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={form.password}
              onChange={set('password')}
              className={cn('pl-10 pr-10', errCls(errors.password))}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="Toggle password visibility">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {form.password && (
            <div className="mt-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted">Password strength</span>
                <span className="text-xs font-semibold" style={{ color: strengthAccent }}>{strengthLabel}</span>
              </div>
              <Progress value={strengthPct} accent={strengthAccent} />
              <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {RULES.map((r) => {
                  const ok = r.test(form.password);
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
          {errors.password && <p className="mt-1.5 text-xs font-medium text-danger">{errors.password}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" type="date" value={form.dob} onChange={set('dob')} className={cn('mt-1.5', errCls(errors.dob))} />
            {errors.dob ? (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.dob}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted">Must be 21+</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select id="state" value={form.state} onChange={set('state')} className={cn('mt-1.5', errCls(errors.state))}>
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            {errors.state && <p className="mt-1.5 text-xs font-medium text-danger">{errors.state}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="promo">Promo code <span className="font-normal text-muted">(optional)</span></Label>
          <Input id="promo" placeholder="WELCOME200" value={form.promo} onChange={set('promo')} className="mt-1.5 uppercase" />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-xs leading-relaxed text-secondary">
            I confirm I am 21+ and agree to the{' '}
            <Link href="#" className="text-primary hover:brightness-110">Terms of Service</Link> and{' '}
            <Link href="#" className="text-primary hover:brightness-110">Privacy Policy</Link>.
          </span>
        </label>
        {errors.terms && <p className="text-xs font-medium text-danger">{errors.terms}</p>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {!loading && (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6">
        <Divider label="or sign up with" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="secondary" size="lg" onClick={() => toast.info('Google sign-up', 'This is a demo — social auth is simulated.')}>
          <GoogleIcon className="h-5 w-5" /> Google
        </Button>
        <Button variant="secondary" size="lg" onClick={() => toast.info('Apple sign-up', 'This is a demo — social auth is simulated.')}>
          <AppleIcon className="h-5 w-5" /> Apple
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:brightness-110">Sign in</Link>
      </p>
    </div>
  );
}
