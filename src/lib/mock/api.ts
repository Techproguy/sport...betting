'use client';

import { db } from './db';

// Simulated network latency for realistic loading states in the demo.
function delay<T>(data: T, ms = 650): Promise<T> {
  return new Promise((res) => setTimeout(() => res(data), ms));
}

export const mockApi = {
  getEvents: (sport?: string) => {
    const all = db().events;
    return delay(sport ? all.filter((e) => e.sport === sport) : all);
  },
  getLiveEvents: () => delay(db().events.filter((e) => e.status === 'live')),
  getEvent: (id: string) => delay(db().events.find((e) => e.id === id) ?? null),
  getFeatured: () => delay(db().events.filter((e) => e.isFeatured).slice(0, 8), 500),
  getBets: () => delay(db().bets.filter((b) => b.userId === 'usr_0001')),
  getTransactions: () => delay(db().transactions.filter((t) => t.userId === 'usr_0001')),
  getPromotions: () => delay(db().promotions, 400),
  placeBet: (stake: number) => delay({ ok: true, ref: `BET${Math.floor(stake * 1000)}` }, 1100),
  deposit: (amount: number) => delay({ ok: true, amount, ref: `DEP${Math.floor(amount)}` }, 1400),
  withdraw: (amount: number) => delay({ ok: true, amount, ref: `WDL${Math.floor(amount)}` }, 1600),
};
