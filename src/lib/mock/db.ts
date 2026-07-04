import {
  generateEvents, generateUsers, generateBets, generateTransactions, generateKyc,
  generateFraud, generateAdmins, generateAudit, generatePromotions, generateNotifications, generateSeries,
} from './generate';

// Build the whole in-memory "database" once. Deterministic via seeded RNG.
function build() {
  const events = generateEvents(250);
  const users = generateUsers(100);
  const bets = generateBets(users, events, 1000);
  const transactions = generateTransactions(users, 1000);
  const kyc = generateKyc(users, 50);
  const fraud = generateFraud(users, 20);
  const admins = generateAdmins(25);
  const audit = generateAudit(admins, 40);
  const promotions = generatePromotions();
  const notifications = generateNotifications();
  const series = generateSeries();
  return { events, users, bets, transactions, kyc, fraud, admins, audit, promotions, notifications, series };
}

let cache: ReturnType<typeof build> | null = null;

export function db() {
  if (!cache) cache = build();
  return cache;
}

// ---- The signed-in demo user (a curated persona) ----
export function currentUser() {
  return {
    id: 'usr_0001',
    name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 (201) 555-0142',
    avatar: '',
    country: 'United States',
    state: 'NJ',
    balance: 4820.5,
    pendingBalance: 250,
    vip: 'Platinum' as const,
    kycStatus: 'approved' as const,
    memberSince: 'Mar 2024',
  };
}
