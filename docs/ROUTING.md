# Routing Map & Navigation Flow

All routes use the Next.js App Router. Layouts are grouped so each area has its own chrome.

## Route groups & layouts

| Group / dir | Layout chrome | Routes |
| --- | --- | --- |
| `app/(public)` | Top `Header` + `Footer` + mobile Bet Slip | marketing & sportsbook |
| `app/(auth)` | Split-screen brand panel | authentication |
| `app/kyc` | Standalone centered wizard | KYC onboarding |
| `app/dashboard` | `Header` + left `DashboardSidebar` | user account & wallet |
| `app/admin` | Fixed `AdminSidebar` + `AdminTopbar` | operator console |

## Full route table

### Public (`(public)`)
| Path | Screen |
| --- | --- |
| `/` | Homepage — hero, live ticker, featured, promotions, trending, testimonials, CTA |
| `/sports` | Sportsbook browse — search, sport chips, live/upcoming/trending filters, bet slip |
| `/live` | Live/in-play betting — scoreboards, pulsing markets |
| `/event/[id]` | Event detail — overview, stats, odds history, all markets, bet slip |
| `/promotions` | Promotions & bonuses grid |
| `/results` | Settled results by sport |
| `/help` | Help center — search, categories, FAQ accordion, support |

### Auth (`(auth)`)
| Path | Screen |
| --- | --- |
| `/login` | Email/password + Google/Apple/Phone |
| `/register` | Signup with password-strength meter, 21+ gate |
| `/forgot-password` | Request reset link |
| `/reset-password` | Set new password |
| `/verify-email` | Email verification + resend timer |
| `/verify-phone` | 6-box OTP verification |
| `/two-factor` | 2FA (authenticator / SMS) |

### KYC
| Path | Screen |
| --- | --- |
| `/kyc` | 8-step wizard (personal → address → SSN → gov ID → proof of address → face → review → submitted) |

### User Dashboard (`dashboard`)
| Path | Screen |
| --- | --- |
| `/dashboard` | Home — balance, pending, today's bets, total bets, won/lost, ROI, win rate, activity |
| `/dashboard/bets` | My Bets — pending/won/lost/cashout tabs |
| `/dashboard/bet-history` | Full settled history table + export |
| `/dashboard/bonuses` | Active bonuses, wagering progress, history |
| `/dashboard/notifications` | Notification center |
| `/dashboard/wallet` | Wallet overview + payment methods |
| `/dashboard/deposit` | Deposit — method picker, bonus preview |
| `/dashboard/withdraw` | Withdraw — limits, arrival estimates |
| `/dashboard/transactions` | Transaction ledger + filters + export |
| `/dashboard/profile` | Profile & personal info |
| `/dashboard/settings` | Preferences, odds format, notifications |
| `/dashboard/security` | Password, 2FA, sessions, login history |
| `/dashboard/responsible-gambling` | Limits, cooling-off, self-exclusion |

### Admin Console (`admin`)
| Path | Screen |
| --- | --- |
| `/admin` | Overview — handle, GGR, profit, exposure, live events, charts |
| `/admin/users` | User management + detail drawer |
| `/admin/kyc` | KYC review queue + document review drawer |
| `/admin/events` | Event management |
| `/admin/odds` | Sports & odds manager (editable lines) |
| `/admin/bets` | Bet management + void/settle/refund/investigate |
| `/admin/settlement` | Market settlement queue |
| `/admin/risk` | Exposure dashboard + heat map |
| `/admin/fraud` | Fraud cases + investigation drawer |
| `/admin/deposits` | Deposits + approvals |
| `/admin/withdrawals` | Withdrawal approval queue |
| `/admin/payments` | PSP health & reconciliation |
| `/admin/reports` | Report generation & export |
| `/admin/analytics` | BI dashboards |
| `/admin/promotions` | Promotions CMS |
| `/admin/cms` | Content management |
| `/admin/settings` | Platform settings & admin team |
| `/admin/audit` | Audit logs |

## Primary navigation flow

```
Landing (/)
 ├─ Register → /kyc → /dashboard
 ├─ Login → /dashboard
 ├─ Sports (/sports) → Event (/event/[id]) → Bet Slip → Place Bet
 ├─ Live (/live) → in-play Bet Slip
 └─ Header wallet chip → /dashboard/wallet → Deposit / Withdraw

Operator (/admin)
 └─ Overview → Users/Bets/KYC/Fraud (row → detail drawer → action)
            → Risk/Analytics/Reports (charts, export)
```
