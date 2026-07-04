# 🏆 Technoestro Sportsbook — Investor-Grade MVP Demo

> **Company:** Technoestro Solutions · **Product:** Sports Betting Platform (MVP Demo)
> A fully clickable, investor-ready sportsbook front-end — built to feel indistinguishable from
> FanDuel, DraftKings, Bet365, ESPN Bet and Caesars. **Not a real-money operator.** All data is mocked.

![Theme](https://img.shields.io/badge/theme-dark--first-0A0A0A) ![Primary](https://img.shields.io/badge/primary-%2300D66F-00D66F) ![Stack](https://img.shields.io/badge/Next.js-15-black) ![Status](https://img.shields.io/badge/status-demo-brightgreen)

---

## ✨ What this is

A complete, navigable sportsbook demo covering the **public site**, **authentication**, **KYC onboarding**,
the **sportsbook & bet slip**, a full **user dashboard + wallet**, **responsible gambling** tooling, and an
**enterprise admin console** (trading, risk, fraud, finance, analytics, CMS). Everything is powered by a
deterministic, seeded mock database — no backend required.

Suitable for: investor presentations · client demos · user testing · pitch decks · MVP validation · stakeholder sign-off.

## 🧰 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router, React 19, TypeScript) |
| Styling | **TailwindCSS v3** + custom design tokens, `tailwindcss-animate` |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| State | **Zustand** (bet slip, toasts) |
| Forms | **React Hook Form** + custom validation |
| Icons | **Lucide** |
| Backend | **Mock only** — seeded generators, in-memory DB, simulated-latency API, JSON exports |

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (fully type-checked)
npm start
```

## 🗺️ Key Routes (see [`docs/ROUTING.md`](docs/ROUTING.md) for the full map)

| Area | Route | Highlights |
| --- | --- | --- |
| **Public** | `/` | Hero, live ticker, featured matches, promotions, trending, testimonials |
| | `/sports` · `/live` · `/event/[id]` | Browse, in-play, full market depth + odds history |
| | `/promotions` · `/results` · `/help` | Bonuses, settled results, FAQ/support |
| **Auth** | `/login` `/register` `/forgot-password` `/reset-password` | Email/phone/Google/Apple, validation |
| | `/verify-email` `/verify-phone` `/two-factor` | OTP boxes, 2FA, resend timers |
| **KYC** | `/kyc` | 8-step wizard: personal → address → SSN → ID → proof → face → review → submitted |
| **Dashboard** | `/dashboard` | Balance, ROI, win-rate, recent activity, charts |
| | `/dashboard/bets` · `/bet-history` · `/bonuses` · `/notifications` | Bet tracking & rewards |
| | `/dashboard/wallet` · `/deposit` · `/withdraw` · `/transactions` | Full wallet flows |
| | `/dashboard/profile` · `/settings` · `/security` · `/responsible-gambling` | Account controls |
| **Admin** | `/admin` | Ops overview: handle, GGR, exposure, live events, charts |
| | `/admin/users` `/kyc` `/events` `/odds` `/bets` `/settlement` | Trading operations |
| | `/admin/risk` `/fraud` `/deposits` `/withdrawals` `/payments` | Risk & finance |
| | `/admin/reports` `/analytics` `/promotions` `/cms` `/settings` `/audit` | Insights & platform |

## 🎯 Signature Interactions

- **Live bet slip** (`Zustand`) — tap any odds to add; single/parlay modes; live parlay odds; stake chips;
  tax-withholding + potential-payout math; animated "Bet Placed!" success; sticky sidebar on desktop,
  slide-up sheet on mobile.
- **KYC wizard** — simulated document uploads with progress bars, a face-scan animation, and verification badges.
- **Admin drawers** — click any user/bet/KYC/fraud row for a slide-in detail panel with real actions (toasts).
- **Charts everywhere** — revenue, GGR, handle, deposits vs withdrawals, exposure heat-maps, win/loss donuts.
- **States** — loading skeletons, empty states, success/error/warning toasts, hover micro-interactions.

## 🎨 Design System

Dark-mode-first, premium and enterprise-grade. Full reference in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

| Token | Value | | Token | Value |
| --- | --- | --- | --- | --- |
| Primary | `#00D66F` | | Background | `#0A0A0A` |
| Card | `#151515` | | Border | `#2A2A2A` |
| Warning | `#FFC107` | | Danger | `#FF4D4F` |
| Text | `#FFFFFF` | | Secondary | `#A0A0A0` |

Typography: **Inter** (Geist / SF Pro spacing).

## 🗃️ Mock Data

Deterministic, seeded (`mulberry32`) so SSR and client always match. Generated at runtime and exported as JSON
under [`mock/`](mock/). Volumes: **100 users · 500 deposits + 500 withdrawals · 1,000 bets · 250 events
(50 live) · 100+ parlays · 6 promotions · 25 admins · 20 fraud cases · 50 KYC submissions**. Sports covered:
NFL, NBA, MLB, NHL, Soccer, Tennis, MMA, Boxing, Golf, Cricket. See [`docs/SCHEMA.md`](docs/SCHEMA.md).

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/        # marketing + sportsbook (Header/Footer/mobile bet slip)
│   ├── (auth)/          # login, register, OTP, 2FA (split-screen layout)
│   ├── kyc/             # 8-step verification wizard
│   ├── dashboard/       # user account + wallet (Header + sidebar)
│   ├── admin/           # enterprise console (fixed sidebar)
│   ├── layout.tsx       # root + global Toaster
│   ├── globals.css      # tokens, scrollbars, skeleton shimmer
│   └── not-found.tsx
├── components/
│   ├── ui/              # Button, Card, Badge, Input, Tabs, Skeleton, Avatar, Toaster, misc
│   ├── layout/          # Header, Footer, Dashboard/Admin sidebars, Admin topbar
│   ├── sportsbook/      # TeamLogo, OddsButton, EventCard, BetSlip
│   ├── home/            # Hero + homepage sections
│   ├── charts/          # Recharts wrappers
│   ├── admin/           # AdminPage shell, DataTable, status pills
│   ├── kyc/             # KycWizard
│   └── brand/           # Logo
├── lib/
│   ├── mock/            # seed, catalog, generators, in-memory db, mock API
│   ├── types.ts         # domain model
│   └── utils.ts         # currency/odds/date helpers, cn()
└── store/               # Zustand: betSlip, toast
```

## 📚 Documentation

- [`docs/ROUTING.md`](docs/ROUTING.md) — full route map & navigation flow
- [`docs/SCHEMA.md`](docs/SCHEMA.md) — mock database schema
- [`docs/FLOWS.md`](docs/FLOWS.md) — user & admin flow diagrams
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — colors, type, components, motion

---

**21+ · Demo product only · Gambling problem? Call 1-800-GAMBLER.**
© 2026 Technoestro Solutions.
