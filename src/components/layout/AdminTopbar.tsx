'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Bell, Menu, X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

export function AdminTopbar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        <button onClick={() => setOpen(true)} className="text-secondary lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-muted" />
            <input placeholder="Search users, bets, events…" className="w-52 bg-transparent text-sm outline-none placeholder:text-muted" />
            <kbd className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-md text-secondary hover:bg-elevated">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card py-1.5 pl-1.5 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-danger to-orange-500 text-xs font-bold text-white">
              SA
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold">Sarah Admin</p>
              <p className="text-[10px] text-muted">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/60 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card lg:hidden">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 text-secondary">
                <X className="h-5 w-5" />
              </button>
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
