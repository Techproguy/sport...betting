'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, ShieldCheck, Zap, ArrowRight, UserPlus, CreditCard, Rocket } from 'lucide-react';
import { db } from '@/lib/mock/db';
import { toast } from '@/store/toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'all', label: 'All offers', tags: [] as string[] },
  { value: 'welcome', label: 'Welcome', tags: ['WELCOME', 'RISK-FREE'] },
  { value: 'parlay', label: 'Parlay', tags: ['PARLAY', 'SGP'] },
  { value: 'boost', label: 'Boost', tags: ['BOOST'] },
  { value: 'referral', label: 'Referral', tags: ['REFERRAL'] },
];

const STEPS = [
  { icon: UserPlus, title: 'Opt in', body: 'Pick an offer and tap claim. Most bonuses activate instantly on your account.' },
  { icon: CreditCard, title: 'Deposit & bet', body: 'Fund your wallet and place a qualifying bet that meets the offer terms.' },
  { icon: Rocket, title: 'Get rewarded', body: 'Bonus bets and boosts land automatically once conditions are met.' },
];

export default function PromotionsPage() {
  const promos = db().promotions;
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.value === category);
    if (!cat || cat.tags.length === 0) return promos;
    return promos.filter((p) => cat.tags.includes(p.tag));
  }, [promos, category]);

  function claim(title: string) {
    toast.success('Offer claimed!', `${title} is now active on your account.`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/12 to-transparent" />
        <div className="grid-radial absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-[1600px] px-4 py-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> New & returning players
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Promotions & bonuses that actually pay
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-secondary">
              Claim welcome offers, odds boosts, parlay insurance and more. New promos drop every week.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-4 py-8">
        {/* Category chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                category === c.value
                  ? 'border-primary bg-primary/12 text-primary'
                  : 'border-border bg-card text-secondary hover:border-primary/50 hover:text-foreground'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Promo grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6"
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: p.color }}
              />
              {p.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                  Featured
                </span>
              )}
              <span
                className="relative inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: `${p.color}1f`, color: p.color, borderColor: `${p.color}55` }}
              >
                <Gift className="h-3 w-3" /> {p.tag}
              </span>
              <p className="relative mt-4 text-4xl font-extrabold tabular-nums" style={{ color: p.color }}>
                {p.value}
              </p>
              <p className="relative mt-2 text-lg font-semibold">{p.title}</p>
              <p className="relative mt-1 flex-1 text-sm text-secondary">{p.subtitle}</p>
              <div className="relative mt-5 flex items-center gap-2">
                <Button className="gap-1.5" onClick={() => claim(p.title)}>
                  {p.cta} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="relative mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted">
                {p.terms}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How bonuses work */}
        <section className="mt-14">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Simple as 1-2-3</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">How bonuses work</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative rounded-lg border border-border bg-card p-6"
              >
                <span className="absolute right-5 top-5 text-3xl font-extrabold text-elevated">{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-secondary">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-lg border border-border bg-surface/50 px-6 py-5 text-sm text-secondary">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Licensed & regulated
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" /> Instant bonus crediting
          </span>
          <span className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-info" /> No hidden wagering traps
          </span>
        </div>

        {/* Terms footer */}
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted">
          All promotions are subject to full terms and conditions and are available only in eligible states to players
          21 and over. Bonus bets are non-withdrawable and expire per each offer&apos;s schedule. Technoestro reserves
          the right to amend or withdraw any promotion at any time. Gambling problem? Call 1-800-GAMBLER.
        </p>
      </div>
    </div>
  );
}
