import type {
  SportEvent, Market, MarketSelection, User, Bet, BetLeg, Transaction, KycSubmission,
  FraudCase, AdminUser, AuditLog, Promotion, AppNotification, SportKey, EventStatus, Team,
} from '../types';
import { makeRng, isoFromNow } from './seed';
import {
  SPORTS, TEAMS, VENUES, FIRST_NAMES, LAST_NAMES, US_STATES, PROMOTIONS_SEED,
} from './catalog';

const rng = makeRng(20260704);

// ---------------- odds helpers ----------------
function oddsPair(r = rng) {
  const fav = -r.int(105, 320);
  const dog = r.int(100, Math.min(400, Math.abs(fav) + r.int(20, 120)));
  return [fav, dog];
}

function makeMarkets(home: Team, away: Team, sport: SportKey): Market[] {
  const [ml1, ml2] = oddsPair();
  const spreadLine = rng.float(1.5, 9.5, 1);
  const totalLine = sport === 'Soccer' ? rng.float(2.5, 3.5, 1) : rng.int(38, 232) + 0.5;
  const sel = (id: string, label: string, odds: number, line?: number): MarketSelection => ({
    id, label, odds, line, trend: rng.pick(['up', 'down', 'flat'] as const),
  });
  const markets: Market[] = [
    {
      id: 'ml', key: 'moneyline', name: 'Moneyline',
      selections: [sel('ml-h', home.short, ml1), sel('ml-a', away.short, ml2)],
    },
    {
      id: 'sp', key: 'spread', name: 'Spread',
      selections: [
        sel('sp-h', `${home.short} -${spreadLine}`, -110, -spreadLine),
        sel('sp-a', `${away.short} +${spreadLine}`, -110, spreadLine),
      ],
    },
    {
      id: 'tot', key: 'total', name: 'Total',
      selections: [
        sel('tot-o', `Over ${totalLine}`, rng.int(-118, -102), totalLine),
        sel('tot-u', `Under ${totalLine}`, rng.int(-118, -102), totalLine),
      ],
    },
    {
      id: 'props', key: 'props', name: 'Player Props',
      selections: [
        sel('p1', 'Top Scorer', rng.int(120, 650)),
        sel('p2', 'Anytime TD / Goal', rng.int(-160, 240)),
        sel('p3', 'First to Score', rng.int(140, 380)),
        sel('p4', 'Double Result', rng.int(200, 900)),
      ],
    },
    {
      id: 'fut', key: 'futures', name: 'Championship Futures',
      selections: [
        sel('f1', `${home.short} to win title`, rng.int(300, 1400)),
        sel('f2', `${away.short} to win title`, rng.int(300, 1400)),
      ],
    },
  ];
  return markets;
}

function combinedOdds(list: number[]) {
  const dec = list.reduce((acc, o) => acc * (o > 0 ? o / 100 + 1 : 100 / Math.abs(o) + 1), 1);
  // back to american
  return dec >= 2 ? Math.round((dec - 1) * 100) : Math.round(-100 / (dec - 1));
}

// ---------------- events ----------------
export function generateEvents(count = 250): SportEvent[] {
  const events: SportEvent[] = [];
  for (let i = 0; i < count; i++) {
    const sportMeta = SPORTS[i % SPORTS.length];
    const sport = sportMeta.key;
    const pool = TEAMS[sport];
    const home = pool[rng.int(0, pool.length - 1)];
    let away = pool[rng.int(0, pool.length - 1)];
    while (away.short === home.short) away = pool[rng.int(0, pool.length - 1)];

    const isLive = i < 50; // first 50 live
    const status: EventStatus = isLive
      ? 'live'
      : rng.bool(0.12)
      ? 'finished'
      : 'upcoming';
    const minutesOffset = isLive ? -rng.int(4, 70) : status === 'finished' ? -rng.int(120, 4000) : rng.int(20, 8000);

    events.push({
      id: `evt_${String(i + 1).padStart(4, '0')}`,
      sport,
      league: sportMeta.league,
      home: { ...home, record: `${rng.int(20, 55)}-${rng.int(5, 40)}` },
      away: { ...away, record: `${rng.int(20, 55)}-${rng.int(5, 40)}` },
      startTime: isoFromNow(minutesOffset),
      status,
      clock: isLive ? rng.pick(['Q1 09:22', 'Q2 04:51', 'Q3 07:10', 'Q4 01:38', '2nd 33:12', 'Set 2', 'Round 3', '7th inning']) : undefined,
      scoreHome: isLive || status === 'finished' ? rng.int(0, sport === 'Soccer' ? 4 : 112) : undefined,
      scoreAway: isLive || status === 'finished' ? rng.int(0, sport === 'Soccer' ? 4 : 112) : undefined,
      markets: makeMarkets(home, away, sport),
      isFeatured: i < 8 || rng.bool(0.05),
      isTrending: rng.bool(0.22),
      betCount: rng.int(120, 24000),
      venue: rng.pick(VENUES),
    });
  }
  return events;
}

// ---------------- users ----------------
export function generateUsers(count = 100): User[] {
  const users: User[] = [];
  const vips = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;
  const statuses = ['active', 'active', 'active', 'active', 'restricted', 'suspended', 'banned'] as const;
  const kyc = ['approved', 'approved', 'approved', 'pending', 'rejected', 'not_started'] as const;
  for (let i = 0; i < count; i++) {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const name = `${first} ${last}`;
    const deposits = rng.int(200, 85000);
    const won = rng.int(100, 120000);
    const lost = rng.int(100, 130000);
    users.push({
      id: `usr_${String(i + 1).padStart(4, '0')}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${rng.int(1, 99)}@email.com`,
      phone: `+1 (${rng.int(200, 989)}) ${rng.int(200, 999)}-${String(rng.int(0, 9999)).padStart(4, '0')}`,
      avatar: '',
      country: 'United States',
      state: rng.pick(US_STATES),
      joinedAt: isoFromNow(-rng.int(1, 720) * 60 * 24),
      status: rng.pick(statuses),
      kycStatus: rng.pick(kyc),
      balance: rng.float(0, 12000),
      pendingBalance: rng.bool(0.3) ? rng.float(20, 3000) : 0,
      lifetimeDeposits: deposits,
      lifetimeWithdrawals: rng.int(0, deposits),
      totalBets: rng.int(3, 2400),
      totalWon: won,
      totalLost: lost,
      riskScore: rng.int(2, 98),
      vip: rng.pick(vips),
      lastActive: isoFromNow(-rng.int(1, 4000)),
    });
  }
  return users;
}

// ---------------- bets ----------------
export function generateBets(users: User[], events: SportEvent[], count = 1000): Bet[] {
  const bets: Bet[] = [];
  const statuses = ['pending', 'won', 'won', 'lost', 'lost', 'lost', 'void', 'cashout'] as const;
  for (let i = 0; i < count; i++) {
    const user = rng.pick(users);
    const isParlay = rng.bool(0.32);
    const legCount = isParlay ? rng.int(2, 6) : 1;
    const legs: BetLeg[] = [];
    let sport: SportKey = 'NFL';
    for (let l = 0; l < legCount; l++) {
      const ev = rng.pick(events);
      sport = ev.sport;
      const mkt = ev.markets[rng.int(0, 2)];
      const s = rng.pick(mkt.selections);
      legs.push({
        eventId: ev.id,
        eventLabel: `${ev.away.short} @ ${ev.home.short}`,
        marketName: mkt.name,
        selectionLabel: s.label,
        odds: s.odds,
        result: rng.pick(['won', 'lost', 'pending'] as const),
      });
    }
    const stake = rng.pick([5, 10, 20, 25, 50, 75, 100, 150, 250, 500, 1000]);
    const combined = combinedOdds(legs.map((l) => l.odds));
    const dec = combined > 0 ? combined / 100 + 1 : 100 / Math.abs(combined) + 1;
    const status = rng.pick(statuses);
    bets.push({
      id: `bet_${String(i + 1).padStart(5, '0')}`,
      userId: user.id,
      type: isParlay ? 'parlay' : 'single',
      legs,
      stake,
      combinedOdds: combined,
      potentialPayout: Number((stake * dec).toFixed(2)),
      status,
      placedAt: isoFromNow(-rng.int(5, 20000)),
      settledAt: status !== 'pending' ? isoFromNow(-rng.int(1, 4000)) : undefined,
      sport,
    });
  }
  return bets;
}

// ---------------- transactions ----------------
export function generateTransactions(users: User[], count = 1000): Transaction[] {
  const txs: Transaction[] = [];
  const methods = ['Visa', 'Mastercard', 'ACH', 'PayPal', 'Apple Pay'] as const;
  const dStatus = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed'] as const;
  for (let i = 0; i < count; i++) {
    const user = rng.pick(users);
    const isDeposit = i % 2 === 0;
    txs.push({
      id: `txn_${String(i + 1).padStart(5, '0')}`,
      userId: user.id,
      type: isDeposit ? 'deposit' : 'withdrawal',
      method: rng.pick(methods),
      amount: rng.pick([25, 50, 100, 150, 200, 250, 500, 750, 1000, 2500, 5000]),
      status: rng.pick(dStatus),
      createdAt: isoFromNow(-rng.int(5, 40000)),
      reference: `TX${rng.int(100000, 999999)}`,
    });
  }
  return txs;
}

// ---------------- kyc ----------------
export function generateKyc(users: User[], count = 50): KycSubmission[] {
  const docs = ['Passport', "Driver's License", 'State ID', 'Military ID'];
  const flags = ['Address mismatch', 'Duplicate device', 'PEP match', 'Selfie low confidence', 'VPN detected', 'Underage risk'];
  const status = ['pending', 'pending', 'approved', 'rejected'] as const;
  return Array.from({ length: count }, (_, i) => {
    const u = rng.pick(users);
    return {
      id: `kyc_${String(i + 1).padStart(4, '0')}`,
      userId: u.id,
      userName: u.name,
      submittedAt: isoFromNow(-rng.int(10, 8000)),
      status: rng.pick(status),
      documentType: rng.pick(docs),
      country: 'United States',
      riskFlags: rng.bool(0.4) ? rng.shuffle(flags).slice(0, rng.int(1, 2)) : [],
    };
  });
}

// ---------------- fraud ----------------
export function generateFraud(users: User[], count = 20): FraudCase[] {
  const types = ['Multiple accounts', 'VPN / proxy usage', 'Location mismatch', 'Bonus abuse', 'Arbitrage pattern', 'Structuring deposits', 'Card testing', 'Collusion ring'];
  const sev = ['low', 'medium', 'high', 'critical'] as const;
  const st = ['open', 'investigating', 'escalated', 'resolved'] as const;
  return Array.from({ length: count }, (_, i) => {
    const u = rng.pick(users);
    const type = rng.pick(types);
    return {
      id: `frd_${String(i + 1).padStart(4, '0')}`,
      userId: u.id,
      userName: u.name,
      type,
      severity: rng.pick(sev),
      detectedAt: isoFromNow(-rng.int(30, 12000)),
      status: rng.pick(st),
      detail: `${type} detected across ${rng.int(2, 9)} sessions with correlated fingerprints.`,
      ip: `${rng.int(24, 210)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`,
      device: rng.pick(['iPhone 15 Pro', 'Pixel 8', 'MacBook Pro', 'Windows 11 / Chrome', 'iPad Air', 'Samsung S24']),
    };
  });
}

// ---------------- admin users ----------------
export function generateAdmins(count = 25): AdminUser[] {
  const roles = ['Super Admin', 'Risk Manager', 'Support', 'Finance', 'Compliance'] as const;
  return Array.from({ length: count }, (_, i) => {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    return {
      id: `adm_${String(i + 1).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}@technoestro.com`,
      role: rng.pick(roles),
      lastLogin: isoFromNow(-rng.int(2, 3000)),
      status: rng.bool(0.85) ? 'active' : 'inactive',
    };
  });
}

// ---------------- audit logs ----------------
export function generateAudit(admins: AdminUser[], count = 40): AuditLog[] {
  const actions = [
    'Approved KYC submission', 'Voided bet', 'Settled market', 'Suspended user', 'Adjusted odds',
    'Approved withdrawal', 'Flagged fraud case', 'Updated promotion', 'Changed risk limit', 'Exported report',
  ];
  return Array.from({ length: count }, (_, i) => {
    const a = rng.pick(admins);
    return {
      id: `aud_${String(i + 1).padStart(4, '0')}`,
      actor: a.name,
      action: rng.pick(actions),
      target: rng.pick(['usr_0042', 'bet_00219', 'evt_0007', 'kyc_0011', 'txn_00320', 'promo_03']),
      timestamp: isoFromNow(-rng.int(1, 6000)),
      ip: `${rng.int(24, 210)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`,
    };
  });
}

// ---------------- promotions ----------------
export function generatePromotions(): Promotion[] {
  return PROMOTIONS_SEED.map((p, i) => ({
    id: `promo_${String(i + 1).padStart(2, '0')}`,
    title: p.title,
    subtitle: p.subtitle,
    tag: p.tag,
    color: p.color,
    cta: p.cta,
    value: p.value,
    terms: '21+. Terms apply. Available in eligible states. Gambling problem? Call 1-800-GAMBLER.',
    featured: i < 3,
  }));
}

// ---------------- notifications ----------------
export function generateNotifications(): AppNotification[] {
  const items: Omit<AppNotification, 'id' | 'createdAt' | 'read'>[] = [
    { title: 'Bet won! 🎉', body: 'Your $50 parlay on Lakers ML hit. $412.50 credited.', type: 'bet' },
    { title: 'Deposit successful', body: '$250 added via Visa •••• 4242.', type: 'wallet' },
    { title: 'Odds boost live', body: 'Chiefs -3.5 boosted to +140 — 2 hours left.', type: 'promo' },
    { title: 'New login detected', body: 'Chrome on macOS · Newark, NJ. Was this you?', type: 'security' },
    { title: 'Withdrawal processing', body: 'Your $1,000 ACH withdrawal is on the way.', type: 'wallet' },
    { title: 'Cash out available', body: 'Cash out your live bet on Celtics for $88.20.', type: 'bet' },
    { title: 'Weekend free bet', body: '$25 free bet dropped into your account.', type: 'promo' },
    { title: 'KYC approved', body: 'Your identity is verified. Full limits unlocked.', type: 'system' },
  ];
  return items.map((n, i) => ({
    ...n,
    id: `ntf_${i + 1}`,
    read: i > 3,
    createdAt: isoFromNow(-rng.int(5, 4000)),
  }));
}

// ---------------- analytics series ----------------
export function generateSeries() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenue = months.map((m, i) => ({
    month: m,
    handle: rng.int(2_400_000, 8_800_000),
    ggr: rng.int(180_000, 720_000),
    revenue: rng.int(120_000, 560_000),
    users: 4200 + i * rng.int(320, 900),
  }));
  const daily = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    deposits: rng.int(60_000, 220_000),
    withdrawals: rng.int(30_000, 150_000),
    bets: rng.int(3_000, 14_000),
  }));
  const sportVolume = SPORTS.map((s) => ({ sport: s.key, volume: rng.int(120_000, 2_400_000), exposure: rng.int(40_000, 900_000) }));
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, bets: rng.int(200, 3200) }));
  return { revenue, daily, sportVolume, hourly };
}
