// Deterministic seeded PRNG so SSR and client render identical mock data.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: number) {
  const rand = mulberry32(seed);
  return {
    next: rand,
    int: (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min,
    float: (min: number, max: number, dp = 2) => {
      const v = rand() * (max - min) + min;
      return Number(v.toFixed(dp));
    },
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)],
    bool: (p = 0.5) => rand() < p,
    shuffle: <T>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

// Fixed "current time" for the demo so relative timestamps are deterministic.
export const DEMO_NOW = new Date('2026-07-04T18:30:00Z').getTime();

export function isoFromNow(minutesOffset: number) {
  return new Date(DEMO_NOW + minutesOffset * 60_000).toISOString();
}
