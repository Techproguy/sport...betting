# User & Admin Flow Diagrams

## 1. New player onboarding → first bet
```
Homepage ─► Register ─► Email/Phone verify ─► KYC wizard (8 steps) ─► Dashboard
                                                    │
   Personal ─ Address ─ SSN ─ Gov ID ─ Proof ─ Face ─ Review ─ Submitted
                                                    ▼
                                         Deposit ─► Sports ─► Event ─► Bet Slip ─► Place Bet ─► Won/Lost
```

## 2. Bet placement (bet slip)
```
Tap odds (OddsButton) ─► Selection added to Zustand bet slip
   │ 1 selection  ► Single mode
   │ 2+ selections► Parlay tab appears (combined odds computed live)
   ▼
Enter stake (chips $10–$250 or custom)
   ▼
Slip shows: total stake · est. tax withholding (24%) · potential payout · to-win
   ▼
Place Bet ─► loading (mockApi.placeBet) ─► animated "Bet Placed!" ─► toast ─► slip clears
```

## 3. Wallet — deposit / withdraw
```
Deposit:  amount ─ method (Visa/MC/ACH/PayPal/Apple Pay) ─ [card form] ─ bonus preview
          ─► mockApi.deposit ─► success check ─► balance updates ─► toast
Withdraw: amount (min $20, ≤ balance) ─ method ─ arrival estimate ─ fee
          ─► mockApi.withdraw ─► pending queue ─► toast
```

## 4. Responsible gambling
```
Set deposit limits (daily/weekly/monthly) ─► Save (toast)
Session reminders (interval) ─► toggle
Cooling-off (24h / 7d / 30d) ─► select ─► confirm
Self-exclusion (temporary 6mo/1yr | permanent) ─► confirmation modal ─► apply
```

## 5. Admin — user lifecycle
```
/admin/users ─► search/filter ─► row click ─► detail drawer
   drawer actions: Suspend · Ban · Reset KYC · Adjust limits ─► toast + optimistic status
```

## 6. Admin — KYC review
```
/admin/kyc queue ─► row ─► document-review drawer (ID front/back, selfie, extracted fields, risk flags)
   ─► Approve / Reject ─► status updates ─► audit log entry
```

## 7. Admin — bet settlement
```
/admin/settlement queue (finished/live events + open bets + exposure)
   ─► Settle ─► pick winning outcome per market ─► affected bets + payout preview
   ─► Confirm ─► bets move Won/Lost ─► toast
Also /admin/bets: Void · Settle · Refund · Investigate per bet.
```

## 8. Admin — risk & fraud
```
/admin/risk: exposure by sport/event/market ─ max liability ─ heat map ─ live alerts
/admin/fraud: cases (severity) ─► investigation drawer (signals, linked accounts, device/IP, timeline)
   ─► Escalate / Freeze / Resolve / Dismiss ─► toast
```

## 9. Admin — finance approvals
```
/admin/deposits: approve/retry pending ─► toast
/admin/withdrawals: approval queue (KYC + risk shown) ─► Approve / Reject / Hold ─► toast
/admin/payments: PSP health, fees, chargebacks, reconciliation
```

## 10. Admin — insights & platform
```
/admin/analytics + /admin/reports: revenue, users, deposits/withdrawals, sport volume, win/loss ─► export
/admin/promotions + /admin/cms: create/toggle promos, edit banners & static pages
/admin/settings: limits, feature flags, admin team, API keys
/admin/audit: immutable action log
```
