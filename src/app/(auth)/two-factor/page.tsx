'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, MessageSquare, ShieldCheck, RotateCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { toast } from '@/store/toast';

const OTP_LEN = 6;
const RESEND_SECONDS = 30;
const PHONE = '(201) 555-0148';

type Method = 'app' | 'sms';

function maskPhone(p: string): string {
  return p.replace(/\d(?=\d{2})/g, '•');
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [method, setMethod] = React.useState<Method>('app');
  const [code, setCode] = React.useState<string[]>(Array(OTP_LEN).fill(''));
  const [trust, setTrust] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [cooldown, setCooldown] = React.useState(0);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function reset() {
    setCode(Array(OTP_LEN).fill(''));
    setError('');
    refs.current[0]?.focus();
  }

  function chooseMethod(m: Method) {
    setMethod(m);
    reset();
    if (m === 'sms') {
      setCooldown(RESEND_SECONDS);
      toast.info('Code sent', `We texted a 6-digit code to ${maskPhone(PHONE)}.`);
    }
  }

  function setDigit(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    setError('');
    setCode((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < OTP_LEN - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (code[i]) {
        setCode((prev) => {
          const next = [...prev];
          next[i] = '';
          return next;
        });
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setCode((prev) => {
          const next = [...prev];
          next[i - 1] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < OTP_LEN - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN).split('');
    if (!pasted.length) return;
    const next = Array(OTP_LEN).fill('');
    pasted.forEach((d, idx) => (next[idx] = d));
    setCode(next);
    refs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
  }

  function resend() {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    reset();
    toast.info('Code resent', `A new code was sent to ${maskPhone(PHONE)}.`);
  }

  const complete = code.every((d) => d !== '');

  async function verify() {
    if (!complete) {
      setError('Enter all 6 digits');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success('Verified', trust ? 'This device is now trusted for 30 days.' : 'Two-factor authentication complete.');
    router.push('/dashboard');
  }

  const methods: { key: Method; label: string; desc: string; icon: typeof KeyRound }[] = [
    { key: 'app', label: 'Authenticator app', desc: 'Enter the code from your app', icon: KeyRound },
    { key: 'sms', label: 'Text message', desc: `Code sent to ${maskPhone(PHONE)}`, icon: MessageSquare },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">Two-factor authentication</h2>
        <p className="mt-2 text-sm text-secondary">Add a second layer of security to your account.</p>
      </div>

      <div className="space-y-2.5">
        {methods.map((m) => {
          const active = method === m.key;
          return (
            <button
              key={m.key}
              onClick={() => chooseMethod(m.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors',
                active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-primary/15 text-primary' : 'bg-elevated text-secondary')}>
                <m.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-secondary">{m.desc}</p>
              </div>
              <span className={cn('h-4 w-4 rounded-full border-2', active ? 'border-primary bg-primary' : 'border-border')} />
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-secondary">
          {method === 'app' ? <Smartphone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          Enter your 6-digit code
        </p>
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className={cn(
                'h-12 w-11 rounded-md border bg-surface text-center text-xl font-bold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-14 sm:w-12',
                error ? 'border-danger' : d ? 'border-primary' : 'border-border focus-visible:border-primary'
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {error && <p className="mt-3 text-center text-xs font-medium text-danger">{error}</p>}
      </div>

      {method === 'sms' && (
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground disabled:cursor-not-allowed disabled:text-muted"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      )}

      <label className="mt-6 flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3.5">
        <span className="text-sm text-secondary">Trust this device for 30 days</span>
        <Switch checked={trust} onChange={setTrust} />
      </label>

      <Button size="lg" className="mt-5 w-full" loading={loading} onClick={verify} disabled={!complete}>
        {!loading && (
          <>
            <ShieldCheck className="h-4 w-4" /> Verify &amp; continue
          </>
        )}
      </Button>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <Link href="#" className="font-medium text-secondary hover:text-foreground" onClick={() => toast.info('Backup codes', 'Enter one of your saved 10-digit backup codes.')}>
          Use a backup code
        </Link>
        <span className="text-border">·</span>
        <Link href="/login" className="font-medium text-secondary hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
