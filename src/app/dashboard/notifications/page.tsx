'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Gift, Wallet, ShieldAlert, Info, Bell, X, CheckCheck, type LucideIcon } from 'lucide-react';
import { db } from '@/lib/mock/db';
import { timeAgo } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { toast } from '@/store/toast';
import type { AppNotification } from '@/lib/types';

type NType = AppNotification['type'];

const typeMeta: Record<NType, { icon: LucideIcon; color: string; label: string }> = {
  bet: { icon: Ticket, color: '#00D66F', label: 'Bet' },
  promo: { icon: Gift, color: '#A855F7', label: 'Promo' },
  wallet: { icon: Wallet, color: '#3B82F6', label: 'Wallet' },
  security: { icon: ShieldAlert, color: '#FFC107', label: 'Security' },
  system: { icon: Info, color: '#A0A0A0', label: 'System' },
};

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'bet', label: 'Bet' },
  { value: 'promo', label: 'Promo' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(() => db().notifications.map((n) => ({ ...n })));
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () =>
      [...items]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .filter((n) => filter === 'all' || n.type === filter),
    [items, filter],
  );

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All caught up', 'Every notification marked as read.');
  };

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const dismiss = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread updates` : 'You’re all caught up.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Tabs tabs={tabs} value={filter} onChange={setFilter} />
      </motion.div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {filtered.map((n, i) => {
            const meta = typeMeta[n.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
                onClick={() => markRead(n.id)}
                className={[
                  'group relative flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors',
                  n.read ? 'bg-card opacity-70 hover:opacity-100' : 'bg-elevated',
                ].join(' ')}
                style={n.read ? undefined : { borderLeftColor: meta.color, borderLeftWidth: 3 }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />}
                    <p className={['truncate text-sm font-semibold', n.read ? 'text-secondary' : 'text-foreground'].join(' ')}>
                      {n.title}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-secondary">{n.body}</p>
                  <p className="mt-1.5 text-xs text-muted">{timeAgo(n.createdAt)}</p>
                </div>

                <button
                  aria-label="Dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                  className="rounded-md p-1 text-muted opacity-0 transition-colors hover:bg-card hover:text-foreground group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={filter === 'all' ? 'You’re all caught up — nothing new right now.' : 'Nothing in this category.'}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
