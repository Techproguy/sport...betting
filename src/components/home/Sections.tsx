'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, Star, Quote, ArrowRight, Radio } from 'lucide-react';
import { SPORTS, TESTIMONIALS } from '@/lib/mock/catalog';
import { db } from '@/lib/mock/db';
import { EventCard } from '@/components/sportsbook/EventCard';
import { TeamLogo } from '@/components/sportsbook/TeamLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatOdds, formatCompact, cn } from '@/lib/utils';

export function SportsStrip() {
  return (
    <section className="border-b border-border bg-surface/50">
      <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {SPORTS.map((s) => (
          <Link
            key={s.key}
            href={`/sports?sport=${s.key}`}
            className="group flex flex-shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <span className="text-base">{s.icon}</span>
            {s.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LiveTicker() {
  const live = db().events.filter((e) => e.status === 'live').slice(0, 12);
  return (
    <section className="border-b border-border bg-card/40">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-2.5">
        <span className="flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase text-danger">
          <Radio className="h-3.5 w-3.5 animate-pulse-live" /> Live
        </span>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {live.map((e) => {
            const ml = e.markets[0].selections;
            return (
              <Link
                key={e.id}
                href={`/event/${e.id}`}
                className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap text-xs text-secondary hover:text-foreground"
              >
                <span className="font-semibold text-foreground">
                  {e.away.short} {e.scoreAway}
                </span>
                <span className="text-muted">–</span>
                <span className="font-semibold text-foreground">
                  {e.scoreHome} {e.home.short}
                </span>
                <span className="rounded bg-elevated px-1.5 py-0.5 font-bold text-primary">{formatOdds(ml[0].odds)}</span>
                <span className="text-muted">·</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PromotionsRow() {
  const promos = db().promotions.filter((p) => p.featured);
  return (
    <SectionShell title="Promotions & Bonuses" subtitle="Boost your bankroll" href="/promotions" icon="🎁">
      <div className="grid gap-4 md:grid-cols-3">
        {promos.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6"
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: p.color }} />
            <Badge className="relative" style={{ background: `${p.color}1f`, color: p.color, borderColor: `${p.color}55` }}>
              {p.tag}
            </Badge>
            <p className="relative mt-4 text-3xl font-extrabold" style={{ color: p.color }}>
              {p.value}
            </p>
            <p className="relative mt-1 font-semibold">{p.title}</p>
            <p className="relative mt-1 text-sm text-secondary">{p.subtitle}</p>
            <Link href="/promotions" className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
              {p.cta} <ArrowRight className="h-4 w-4 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}

export function FeaturedMatches() {
  const featured = db().events.filter((e) => e.isFeatured).slice(0, 6);
  return (
    <SectionShell title="Featured Matches" subtitle="The biggest games today" href="/sports" icon="⭐">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((e, i) => (
          <EventCard key={e.id} event={e} index={i} />
        ))}
      </div>
    </SectionShell>
  );
}

export function TrendingBets() {
  const trending = db().events.filter((e) => e.isTrending).slice(0, 6);
  return (
    <SectionShell title="Trending Now" subtitle="Where the money is going" href="/sports" icon="🔥">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trending.map((e, i) => {
          const pick = e.markets[0].selections[0];
          const pct = Math.round((70 + ((i * 7) % 25)));
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/event/${e.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <div className="flex -space-x-2">
                  <TeamLogo team={e.away} size={32} />
                  <TeamLogo team={e.home} size={32} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {e.away.short} @ {e.home.short}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-muted">{pct}% on {pick.label}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-md bg-elevated px-2 py-1 text-xs font-bold text-primary">
                  <Flame className="h-3 w-3" /> {formatCompact(e.betCount)}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-border bg-surface/40 py-16">
      <div className="mx-auto max-w-[1600px] px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Loved by millions of bettors</h2>
          <p className="mt-2 text-secondary">4.8/5 average rating across 120,000+ reviews</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 text-sm text-foreground">{t.quote}</p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={cn('h-3.5 w-3.5', s < t.rating ? 'fill-warning text-warning' : 'text-muted')} />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight">Ready to place your first bet?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-secondary">
          Sign up in under 2 minutes, claim your $200 welcome bonus, and join millions of bettors on Technoestro.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sports">
            <Button size="lg" variant="outline">
              Browse Odds
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">21+. Terms apply. Gambling problem? Call 1-800-GAMBLER.</p>
      </div>
    </section>
  );
}

function SectionShell({
  title,
  subtitle,
  href,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{icon} {subtitle}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary">
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}
