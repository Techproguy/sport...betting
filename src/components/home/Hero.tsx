'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCompact } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid-radial absolute inset-0 opacity-50" />
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> New player offer · Bet $5, Get $200
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Bet smarter.
            <br />
            <span className="text-gradient">Win bigger.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-secondary">
            The next-generation sportsbook. Premium odds, live betting that keeps up, and instant payouts across 10 sports and thousands of markets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Claim $200 Bonus <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sports">
              <Button size="lg" variant="secondary" className="gap-2">
                <Play className="h-4 w-4" /> Explore Sports
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { label: 'Active bettors', value: '2.4M+' },
              { label: 'Bets settled daily', value: '18.6M' },
              { label: 'Avg. payout time', value: '9 min' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <HeroBetCard />
        </motion.div>
      </div>
    </section>
  );
}

function HeroBetCard() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-danger">
            <span className="h-2 w-2 animate-pulse-live rounded-full bg-danger" /> LIVE · Q4 02:14
          </span>
          <span className="text-xs text-muted">🏀 NBA</span>
        </div>
        <div className="space-y-3">
          {[
            { t: 'Boston Celtics', s: 108, c: '#00D66F' },
            { t: 'Denver Nuggets', s: 104, c: '#3B82F6' },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: r.c }}>
                {r.t.split(' ')[1].slice(0, 3).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-semibold">{r.t}</span>
              <span className="text-lg font-bold tabular-nums">{r.s}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: 'BOS ML', o: '-135' },
            { l: 'Spread -2.5', o: '-110' },
            { l: 'Over 214.5', o: '-108' },
          ].map((b, i) => (
            <motion.div
              key={b.l}
              animate={{ borderColor: i === 0 ? ['#2A2A2A', '#00D66F', '#2A2A2A'] : '#2A2A2A' }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              className="flex flex-col items-center rounded-md border border-border bg-surface py-2"
            >
              <span className="text-[10px] text-secondary">{b.l}</span>
              <span className="text-sm font-bold text-primary">{b.o}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-primary/10 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-primary">
              <TrendingUp className="h-4 w-4" /> Cash out available
            </span>
            <span className="font-bold text-primary">$248.60</span>
          </div>
        </div>
      </div>
    </div>
  );
}
