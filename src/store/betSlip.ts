'use client';

import { create } from 'zustand';
import { americanToDecimal } from '@/lib/utils';

export interface Selection {
  id: string; // eventId + selectionId
  eventId: string;
  eventLabel: string;
  marketName: string;
  selectionLabel: string;
  odds: number;
}

interface BetSlipState {
  selections: Selection[];
  stake: number;
  mode: 'single' | 'parlay';
  open: boolean;
  add: (s: Selection) => void;
  remove: (id: string) => void;
  clear: () => void;
  setStake: (n: number) => void;
  setMode: (m: 'single' | 'parlay') => void;
  setOpen: (b: boolean) => void;
  toggle: (s: Selection) => void;
  parlayOdds: () => number;
  potentialPayout: () => number;
}

function combined(list: number[]) {
  const dec = list.reduce((a, o) => a * americanToDecimal(o), 1);
  return dec >= 2 ? Math.round((dec - 1) * 100) : Math.round(-100 / (dec - 1));
}

export const useBetSlip = create<BetSlipState>((set, get) => ({
  selections: [],
  stake: 25,
  mode: 'single',
  open: false,
  add: (s) =>
    set((st) =>
      st.selections.some((x) => x.id === s.id)
        ? st
        : { selections: [...st.selections, s], open: true, mode: st.selections.length >= 1 ? 'parlay' : st.mode }
    ),
  remove: (id) =>
    set((st) => {
      const selections = st.selections.filter((x) => x.id !== id);
      return { selections, mode: selections.length <= 1 ? 'single' : st.mode };
    }),
  clear: () => set({ selections: [], stake: 25 }),
  setStake: (n) => set({ stake: Math.max(0, n) }),
  setMode: (m) => set({ mode: m }),
  setOpen: (b) => set({ open: b }),
  toggle: (s) =>
    set((st) => {
      const exists = st.selections.some((x) => x.id === s.id);
      if (exists) {
        const selections = st.selections.filter((x) => x.id !== s.id);
        return { selections, mode: selections.length <= 1 ? 'single' : st.mode };
      }
      return { selections: [...st.selections, s], open: true, mode: st.selections.length >= 1 ? 'parlay' : st.mode };
    }),
  parlayOdds: () => combined(get().selections.map((s) => s.odds)),
  potentialPayout: () => {
    const { selections, stake, mode } = get();
    if (selections.length === 0) return 0;
    if (mode === 'parlay') {
      const dec = selections.reduce((a, s) => a * americanToDecimal(s.odds), 1);
      return stake * dec;
    }
    // single mode: stake applied to each leg
    return selections.reduce((a, s) => a + stake * americanToDecimal(s.odds), 0);
  },
}));
