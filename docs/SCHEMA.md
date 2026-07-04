# Mock Database Schema

All data is generated deterministically from a seeded PRNG (`mulberry32`, seed `20260704`) in
`src/lib/mock/generate.ts`, memoized by `src/lib/mock/db.ts`, and exported to `mock/*.json`.
Because generation is seeded, server and client renders are byte-identical (no hydration drift).
The demo "now" is pinned to `2026-07-04T18:30:00Z` (`DEMO_NOW`).

## Volumes

| Entity | Count | Notes |
| --- | --- | --- |
| Users | 100 | + 1 curated persona (`usr_0001`, "Alex Morgan") |
| Events | 250 | first 50 are `live`; across 10 sports |
| Bets | 1,000 | ~32% parlays (2–6 legs) |
| Transactions | 1,000 | 500 deposits + 500 withdrawals |
| KYC submissions | 50 | |
| Fraud cases | 20 | |
| Admin users | 25 | |
| Audit logs | 40 | |
| Promotions | 6 | |
| Notifications | 8 | |

## Entities

### User
```ts
id, name, email, phone, avatar, country, state, joinedAt,
status: 'active'|'suspended'|'banned'|'restricted',
kycStatus: 'not_started'|'pending'|'approved'|'rejected',
balance, pendingBalance, lifetimeDeposits, lifetimeWithdrawals,
totalBets, totalWon, totalLost, riskScore (0–100),
vip: 'Bronze'|'Silver'|'Gold'|'Platinum'|'Diamond', lastActive
```

### SportEvent → Market → MarketSelection
```ts
SportEvent { id, sport, league, home:Team, away:Team, startTime,
  status:'upcoming'|'live'|'finished'|'suspended', clock?, scoreHome?, scoreAway?,
  markets:Market[], isFeatured, isTrending, betCount, venue }
Team   { name, short, logo, color, record? }
Market { id, key:'moneyline'|'spread'|'total'|'props'|'futures', name, selections:[] }
MarketSelection { id, label, odds (American), line?, trend?:'up'|'down'|'flat' }
```

### Bet → BetLeg
```ts
Bet { id, userId, type:'single'|'parlay', legs:BetLeg[], stake, combinedOdds,
  potentialPayout, status:'pending'|'won'|'lost'|'void'|'cashout', placedAt, settledAt?, sport }
BetLeg { eventId, eventLabel, marketName, selectionLabel, odds, result? }
```

### Transaction
```ts
id, userId, type:'deposit'|'withdrawal'|'bet'|'payout'|'bonus'|'refund',
method:'Visa'|'Mastercard'|'ACH'|'PayPal'|'Apple Pay'|'Balance',
amount, status:'completed'|'pending'|'failed'|'processing', createdAt, reference
```

### KycSubmission
```ts
id, userId, userName, submittedAt, status, documentType, country, riskFlags[]
```

### FraudCase
```ts
id, userId, userName, type, severity:'low'|'medium'|'high'|'critical',
detectedAt, status:'open'|'investigating'|'resolved'|'escalated', detail, ip, device
```

### AdminUser / AuditLog / Promotion / AppNotification
```ts
AdminUser  { id, name, email, role, lastLogin, status }
AuditLog   { id, actor, action, target, timestamp, ip }
Promotion  { id, title, subtitle, tag, color, cta, terms, value, featured }
Notification { id, title, body, type:'bet'|'promo'|'wallet'|'security'|'system', read, createdAt }
```

### Analytics series (`db().series`)
```ts
revenue: { month, handle, ggr, revenue, users }[]     // 12 months
daily:   { day, deposits, withdrawals, bets }[]        // 30 days
sportVolume: { sport, volume, exposure }[]             // 10 sports
hourly:  { hour, bets }[]                               // 24 hours
```

## Odds math (`src/lib/utils.ts`)
- `americanToDecimal(a)` = `a>0 ? a/100+1 : 100/|a|+1`
- Parlay combined decimal = product of leg decimals; converted back to American for display.
- `impliedProbability`, `payout(stake, odds[])`, and a 24% tax-withholding estimate power the bet slip.
