// ---------- Core domain types for the Technoestro Sportsbook demo ----------

export type SportKey =
  | 'NFL'
  | 'NBA'
  | 'MLB'
  | 'NHL'
  | 'Soccer'
  | 'Tennis'
  | 'MMA'
  | 'Boxing'
  | 'Golf'
  | 'Cricket';

export type EventStatus = 'upcoming' | 'live' | 'finished' | 'suspended';

export interface Team {
  name: string;
  short: string;
  logo: string; // emoji / initials fallback used in UI
  color: string;
  record?: string;
}

export interface MarketSelection {
  id: string;
  label: string;
  odds: number; // american
  line?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface Market {
  id: string;
  key: 'moneyline' | 'spread' | 'total' | 'props' | 'futures';
  name: string;
  selections: MarketSelection[];
}

export interface SportEvent {
  id: string;
  sport: SportKey;
  league: string;
  home: Team;
  away: Team;
  startTime: string; // ISO
  status: EventStatus;
  clock?: string; // "Q3 04:12"
  scoreHome?: number;
  scoreAway?: number;
  markets: Market[];
  isFeatured: boolean;
  isTrending: boolean;
  betCount: number;
  venue: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  cta: string;
  terms: string;
  value: string;
  featured: boolean;
}

export type BetStatus = 'pending' | 'won' | 'lost' | 'void' | 'cashout';
export type BetType = 'single' | 'parlay';

export interface BetLeg {
  eventId: string;
  eventLabel: string;
  marketName: string;
  selectionLabel: string;
  odds: number;
  result?: 'won' | 'lost' | 'pending';
}

export interface Bet {
  id: string;
  userId: string;
  type: BetType;
  legs: BetLeg[];
  stake: number;
  combinedOdds: number;
  potentialPayout: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
  sport: SportKey;
}

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'restricted';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  country: string;
  state: string;
  joinedAt: string;
  status: UserStatus;
  kycStatus: KycStatus;
  balance: number;
  pendingBalance: number;
  lifetimeDeposits: number;
  lifetimeWithdrawals: number;
  totalBets: number;
  totalWon: number;
  totalLost: number;
  riskScore: number; // 0-100
  vip: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  lastActive: string;
}

export type TxType = 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'bonus' | 'refund';
export type TxStatus = 'completed' | 'pending' | 'failed' | 'processing';
export type PaymentMethod = 'Visa' | 'Mastercard' | 'ACH' | 'PayPal' | 'Apple Pay';

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  method: PaymentMethod | 'Balance';
  amount: number;
  status: TxStatus;
  createdAt: string;
  reference: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  submittedAt: string;
  status: KycStatus;
  documentType: string;
  country: string;
  riskFlags: string[];
}

export interface FraudCase {
  id: string;
  userId: string;
  userName: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  detail: string;
  ip: string;
  device: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Risk Manager' | 'Support' | 'Finance' | 'Compliance';
  lastLogin: string;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'bet' | 'promo' | 'wallet' | 'security' | 'system';
  read: boolean;
  createdAt: string;
}
