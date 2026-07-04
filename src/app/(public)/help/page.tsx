'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, ChevronDown, Rocket, Wallet, Scale, ShieldCheck, HeartHandshake, MessageCircle,
  Headset, Mail, LifeBuoy, SearchX,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { toast } from '@/store/toast';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { icon: Rocket, title: 'Getting Started', desc: 'Create an account and place your first bet', accent: '#00D66F' },
  { icon: Wallet, title: 'Deposits & Withdrawals', desc: 'Funding, payouts and payment methods', accent: '#3B82F6' },
  { icon: Scale, title: 'Betting Rules', desc: 'Market grading, voids and settlement', accent: '#FFC107' },
  { icon: ShieldCheck, title: 'Account & Security', desc: 'Verification, 2FA and login help', accent: '#A855F7' },
  { icon: HeartHandshake, title: 'Responsible Gambling', desc: 'Limits, timeouts and self-exclusion', accent: '#22D3EE' },
  { icon: Headset, title: 'Contact', desc: 'Reach our 24/7 support team', accent: '#EC4899' },
];

const FAQS = [
  {
    q: 'How do I create an account?',
    a: 'Tap Create Account, enter your email, phone and date of birth, then verify your identity. Most accounts are approved in under two minutes and you can start betting right away.',
  },
  {
    q: 'What deposit methods are supported?',
    a: 'We accept Visa, Mastercard, ACH bank transfer, PayPal and Apple Pay. Deposits are instant, and there are no fees on standard funding methods.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'PayPal and Apple Pay withdrawals typically settle within minutes. ACH and card withdrawals usually complete within 1-3 business days after review.',
  },
  {
    q: 'Why do I need to verify my identity (KYC)?',
    a: 'Identity verification is a licensing requirement that keeps your funds secure and prevents fraud. You will upload a government ID and a quick selfie — approval is usually instant.',
  },
  {
    q: 'How are bets settled?',
    a: 'Markets are graded using official results as soon as an event concludes. Winning bets are credited to your balance automatically, typically within minutes of settlement.',
  },
  {
    q: 'What happens if an event is postponed or canceled?',
    a: 'If an event is postponed beyond the rescheduling window, affected single bets are voided and your stake is returned. Voided legs inside a parlay are removed and the parlay recalculated.',
  },
  {
    q: 'Can I cash out a bet before it settles?',
    a: 'Yes. When Cash Out is available you will see the option on the bet in your bet slip and open bets. The offered amount updates live based on the current odds.',
  },
  {
    q: 'How do odds boosts and bonus bets work?',
    a: 'Odds boosts enhance the price on selected markets automatically. Bonus bets are staked like cash but the stake is not returned in your winnings — only the profit is paid.',
  },
  {
    q: 'How do I set deposit or time limits?',
    a: 'Go to Responsible Gambling in your account to set daily, weekly or monthly deposit limits, session reminders, cool-off periods or self-exclusion. Limits apply immediately.',
  },
  {
    q: 'Is my account and money safe?',
    a: 'Funds are held in segregated accounts and all data is encrypted in transit and at rest. Enable two-factor authentication in Security settings for an extra layer of protection.',
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  function liveChat() {
    toast.success('Connecting you to support', 'A live agent will be with you in under a minute.');
  }

  return (
    <div>
      {/* Hero + search */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="flex items-center justify-center">
              <LifeBuoy className="h-10 w-10 text-primary" />
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">How can we help?</h1>
            <p className="mt-2 text-secondary">Search our help center or browse popular topics below.</p>
            <div className="relative mx-auto mt-6 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for answers — deposits, KYC, cash out…"
                className="h-12 pl-11 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Category tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <motion.button
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.2) }}
              onClick={() => setQuery(c.title === 'Contact' ? '' : c.title.split(' ')[0])}
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${c.accent}1f`, color: c.accent }}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="mt-0.5 text-sm text-secondary">{c.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-4 text-xl font-bold tracking-tight">Frequently asked questions</h2>
            {filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No answers found"
                description="We couldn't find a match. Try different keywords or reach our 24/7 support team."
                action={<Button onClick={liveChat}>Chat with support</Button>}
              />
            ) : (
              <div className="space-y-2">
                {filtered.map((f, i) => {
                  const isOpen = open === i;
                  return (
                    <div key={f.q} className="overflow-hidden rounded-lg border border-border bg-card">
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                      >
                        <span className="text-sm font-semibold">{f.q}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 flex-shrink-0 text-muted transition-transform',
                            isOpen && 'rotate-180 text-primary'
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <p className="px-4 pb-4 text-sm leading-relaxed text-secondary">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact support card */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Headset className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold">Still need help?</p>
              <p className="mt-1 text-sm text-secondary">
                Our support team is available around the clock, every day of the year.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Agents online · avg. reply under 1 min
              </div>
              <Button className="mt-5 w-full gap-2" onClick={liveChat}>
                <MessageCircle className="h-4 w-4" /> Start live chat
              </Button>
              <button
                onClick={() => toast.info('Email support', 'Write to us at support@technoestro.com')}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium text-secondary transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Mail className="h-4 w-4" /> Email us
              </button>
            </div>

            <div className="rounded-lg border border-border bg-surface/50 p-5 text-sm">
              <p className="font-semibold">Responsible gambling</p>
              <p className="mt-1 text-secondary">
                If gambling stops being fun, help is available 24/7. Call 1-800-GAMBLER or set limits in your account.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
