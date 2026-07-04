'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Ticket, Wallet, Percent, Calendar, Star } from 'lucide-react';
import { db, currentUser } from '@/lib/mock/db';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { toast } from '@/store/toast';

const initialForm = {
  name: currentUser().name,
  email: currentUser().email,
  phone: currentUser().phone,
  address: '142 Riverside Dr, Jersey City, NJ 07310',
  dob: '1990-05-14',
};

export default function ProfilePage() {
  const user = currentUser();
  const [form, setForm] = useState(initialForm);

  const userBets = db().bets.filter((b) => b.userId === 'usr_0001');
  const settled = userBets.filter((b) => b.status === 'won' || b.status === 'lost');
  const won = userBets.filter((b) => b.status === 'won').length;
  const winRate = settled.length > 0 ? Math.round((won / settled.length) * 100) : 0;
  const lifetimeDeposits = db()
    .transactions.filter((t) => t.userId === 'usr_0001' && t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const stats = [
    { icon: Ticket, label: 'Total Bets', value: formatNumber(userBets.length), accent: '#00D66F' },
    { icon: Wallet, label: 'Lifetime Deposits', value: formatCurrency(lifetimeDeposits), accent: '#3B82F6' },
    { icon: Percent, label: 'Win Rate', value: `${winRate}%`, accent: '#A855F7' },
    { icon: Star, label: 'VIP Tier', value: user.vip, accent: '#F5B324' },
    { icon: Calendar, label: 'Member Since', value: user.memberSince, accent: '#A0A0A0' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-secondary">Manage your personal details and account status.</p>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative overflow-hidden rounded-lg border border-border bg-card p-6"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(120% 100% at 100% 0%, #F5B324, transparent 55%)' }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user.name} className="h-20 w-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-secondary">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-black"
                style={{ background: 'linear-gradient(90deg, #F5B324, #FFE08A)' }}
              >
                <Crown className="h-3.5 w-3.5" /> {user.vip}
              </span>
              <Badge variant="success">
                <Check className="mr-1 h-3 w-3" /> Verified
              </Badge>
              <span className="text-xs text-muted">Member since {user.memberSince}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editable form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-base font-semibold">Personal information</h3>
            <p className="mt-1 text-sm text-secondary">Keep your contact and identity details current.</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={set('dob')} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={set('address')} />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setForm(initialForm)}>
                Cancel
              </Button>
              <Button onClick={() => toast.success('Profile updated', 'Your changes have been saved.')}>
                Save changes
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats sidebar */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-secondary">Account stats</h3>
            <div className="mt-4 space-y-3">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-elevated p-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${s.accent}1F`, color: s.accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-secondary">{s.label}</p>
                      <p className="truncate text-sm font-semibold tabular-nums text-foreground">{s.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="px-1 text-center text-xs text-muted">21+. Gambling problem? Call 1-800-GAMBLER.</p>
        </motion.aside>
      </div>
    </div>
  );
}
