'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Ticket, Trash2, CheckCircle2, Zap, ChevronDown } from 'lucide-react';
import { useBetSlip } from '@/store/betSlip';
import { toast } from '@/store/toast';
import { mockApi } from '@/lib/mock/api';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatOdds, americanToDecimal, cn } from '@/lib/utils';

const QUICK = [10, 25, 50, 100, 250];

export function BetSlip() {
  const {
    selections, stake, mode, open, remove, clear, setStake, setMode, setOpen, parlayOdds, potentialPayout,
  } = useBetSlip();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const count = selections.length;
  const payout = potentialPayout();
  const profit = payout - (mode === 'parlay' ? stake : stake * count);
  const totalStake = mode === 'parlay' ? stake : stake * count;
  const tax = Math.max(0, profit * 0.24); // 24% federal withholding estimate

  async function place() {
    setPlacing(true);
    await mockApi.placeBet(totalStake);
    setPlacing(false);
    setPlaced(true);
    toast.success('Bet placed!', `${formatCurrency(totalStake)} on ${count} selection${count > 1 ? 's' : ''}`);
    setTimeout(() => {
      setPlaced(false);
      clear();
    }, 2200);
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <span className="font-semibold">Bet Slip</span>
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button onClick={clear} className="text-xs text-muted hover:text-danger">
              Clear all
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <div className="flex gap-1 border-b border-border p-2">
          {(['single', 'parlay'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors',
                mode === m ? 'bg-elevated text-foreground' : 'text-secondary hover:text-foreground'
              )}
            >
              {m === 'parlay' ? `Parlay (${count})` : `Singles (${count})`}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {count === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-elevated">
                <Ticket className="h-7 w-7 text-muted" />
              </div>
              <p className="font-semibold">Your bet slip is empty</p>
              <p className="mt-1 text-sm text-secondary">Tap any odds to start building your bet.</p>
            </div>
          ) : (
            selections.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, x: 40 }}
                className="mb-2 rounded-md border border-border bg-surface p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.selectionLabel}</p>
                    <p className="truncate text-xs text-secondary">{s.marketName}</p>
                    <p className="truncate text-xs text-muted">{s.eventLabel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold tabular-nums text-primary">{formatOdds(s.odds)}</span>
                    <button onClick={() => remove(s.id)} className="text-muted hover:text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {mode === 'single' && count > 1 && (
                  <p className="mt-2 text-right text-xs text-secondary">
                    Returns {formatCurrency(stake * americanToDecimal(s.odds))}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {count > 0 && (
        <div className="border-t border-border p-4">
          {mode === 'parlay' && count > 1 && (
            <div className="mb-3 flex items-center justify-between rounded-md bg-primary/10 px-3 py-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" /> {count}-Leg Parlay
              </span>
              <span className="font-bold tabular-nums text-primary">{formatOdds(parlayOdds())}</span>
            </div>
          )}

          <label className="mb-1 block text-xs font-medium text-secondary">
            {mode === 'single' && count > 1 ? 'Stake per bet' : 'Stake'}
          </label>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">$</span>
            <input
              type="number"
              value={stake || ''}
              onChange={(e) => setStake(Number(e.target.value))}
              className="h-11 w-full rounded-md border border-border bg-elevated pl-7 pr-3 text-lg font-bold tabular-nums focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mb-3 flex gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setStake(q)}
                className="flex-1 rounded-md border border-border py-1.5 text-xs font-semibold text-secondary hover:border-primary hover:text-primary"
              >
                ${q}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <Row label="Total stake" value={formatCurrency(totalStake)} />
            <Row label="Est. tax withholding (24%)" value={`-${formatCurrency(tax)}`} muted />
            <Row label="Potential payout" value={formatCurrency(payout)} bold />
            <Row label="To win" value={formatCurrency(profit)} accent />
          </div>

          <Button className="mt-4 w-full" size="lg" loading={placing} disabled={placed || stake <= 0} onClick={place}>
            {placed ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Bet Confirmed
              </span>
            ) : (
              `Place Bet · ${formatCurrency(totalStake)}`
            )}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {placed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/95 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15"
            >
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </motion.div>
            <p className="mt-4 text-lg font-bold">Bet Placed!</p>
            <p className="text-sm text-secondary">Good luck 🍀</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, bold, accent, muted }: { label: string; value: string; bold?: boolean; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-secondary', muted && 'text-muted')}>{label}</span>
      <span className={cn('tabular-nums', bold && 'font-bold', accent && 'font-bold text-primary')}>{value}</span>
    </div>
  );
}

/** Desktop sticky sidebar wrapper */
export function BetSlipSidebar() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-[340px] flex-shrink-0 overflow-hidden rounded-lg border border-border bg-card xl:block">
      <BetSlip />
    </aside>
  );
}

/** Mobile floating trigger + sheet */
export function BetSlipMobile() {
  const { selections, open, setOpen } = useBetSlip();
  const count = selections.length;
  return (
    <>
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.button
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-glow xl:hidden"
          >
            <Ticket className="h-5 w-5" />
            Bet Slip ({count})
            <ChevronDown className="h-4 w-4 rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 xl:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[85vh] overflow-hidden rounded-t-2xl border-t border-border bg-card xl:hidden"
            >
              <BetSlip />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
