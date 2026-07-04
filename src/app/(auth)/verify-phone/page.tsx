'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Smartphone, RotateCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/store/toast';

const RESEND_SECONDS = 30;
const PHONE = '(201) 555-0148';
const OTP_LEN = 6;

function maskPhone(p: string): string {
  return p.replace(/\d(?=\d{2})/g, '•');
}

export default function VerifyPhonePage() {
  const router = useRouter();
  const [code, setCode] = React.useState<string[]>(Array(OTP_LEN).fill(''));
  const [cooldown, setCooldown] = React.useState(RESEND_SECONDS);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

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
    setCode(Array(OTP_LEN).fill(''));
    refs.current[0]?.focus();
    toast.info('Code resent', `A new 6-digit code was sent to ${maskPhone(PHONE)}.`);
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
    toast.success('Phone verified', 'Your number is confirmed. Continuing to verification.');
    router.push('/kyc');
  }

  return (
    <div className="animate-fade-up text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Smartphone className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">Verify your phone</h2>
      <p className="mt-2 text-sm text-secondary">
        Enter the 6-digit code we texted to
        <br />
        <span className="font-semibold text-foreground">{maskPhone(PHONE)}</span>
      </p>

      <div className="mt-7 flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
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
      {error && <p className="mt-3 text-xs font-medium text-danger">{error}</p>}

      <Button size="lg" className="mt-6 w-full" loading={loading} onClick={verify} disabled={!complete}>
        {!loading && (
          <>
            <ShieldCheck className="h-4 w-4" /> Verify phone number
          </>
        )}
      </Button>

      <button
        onClick={resend}
        disabled={cooldown > 0}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-foreground disabled:cursor-not-allowed disabled:text-muted"
      >
        <RotateCw className="h-3.5 w-3.5" />
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </button>

      <p className="mt-8 text-center text-sm text-secondary">
        Wrong number?{' '}
        <Link href="/register" className="font-semibold text-primary hover:brightness-110">
          Change it
        </Link>
      </p>
    </div>
  );
}
