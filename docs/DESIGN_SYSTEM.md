# Design System

Dark-mode-first, premium, enterprise-grade. Configured in `tailwind.config.ts` + `src/app/globals.css`.

## Color tokens

| Role | Hex | Tailwind |
| --- | --- | --- |
| Primary / Success | `#00D66F` | `primary`, `success` |
| Background | `#0A0A0A` | `background` |
| Surface | `#0F0F0F` | `surface` |
| Card | `#151515` | `card` |
| Elevated | `#1C1C1C` | `elevated` |
| Border | `#2A2A2A` | `border` |
| Warning | `#FFC107` | `warning` |
| Danger | `#FF4D4F` | `danger` |
| Info | `#3B82F6` | `info` |
| Text | `#FFFFFF` | `foreground` |
| Secondary text | `#A0A0A0` | `secondary` |
| Muted text | `#6B6B6B` | `muted` |

Primary foreground (text on green): `#04150C`. Chart categorical palette:
`#00D66F #3B82F6 #FFC107 #FF4D4F #A855F7 #22D3EE #FB923C #EC4899`.

## Typography
- Family: **Inter** (loaded via Google Fonts), falling back to Geist / SF Pro / system-ui.
- Numbers use `tabular-nums` for odds, money, and stats alignment.
- Weights: 300–900. Headings `font-extrabold tracking-tight`; body `text-secondary`.

## Radius, elevation, motion
- Radius: `lg` 14px (default), `md` 10px, `sm` 8px, pills `rounded-full`.
- Shadows: `shadow-card` (subtle inset + drop), `shadow-glow` (primary halo for CTAs).
- Keyframes: `fade-up`, `pulse-live` (live dots), `shimmer` (skeletons), `odds-up`/`odds-down` (line moves).
- Framer Motion for page/section entrances, drawers, sheets, toasts, and success animations.

## Utility classes (`globals.css`)
`card-surface`, `glass` (blur), `text-gradient`, `grid-radial` (dotted bg), `noise`, `skeleton` (shimmer),
`no-scrollbar`. Custom slim dark scrollbars applied globally.

## Component library (`src/components`)
- **ui**: `Button` (6 variants × 4 sizes, `loading`), `Card*`, `Badge` (7 variants), `Input`/`Label`/`Select`,
  `Tabs`, `Skeleton`, `Avatar`, `Toaster`, and `misc` (`StatCard`, `EmptyState`, `Progress`, `Switch`, `Divider`).
- **sportsbook**: `TeamLogo`, `OddsButton` (bet-slip aware), `EventCard`, `BetSlip` (+ `BetSlipSidebar`, `BetSlipMobile`).
- **charts**: `AreaTrend`, `MultiArea`, `Bars`, `Lines`, `Donut` (Recharts wrappers, themed tooltips).
- **admin**: `AdminPage` (topbar shell), `DataTable`, `StatusPill`, `SeverityPill`.
- **layout**: `Header`, `Footer`, `DashboardSidebar`, `AdminSidebar`, `AdminTopbar`.

## Responsiveness
Mobile-first. Grids collapse to single column; tables gain horizontal scroll; the bet slip becomes a
slide-up sheet; sidebars become slide-in drawers. Breakpoints follow Tailwind defaults, content capped at
`max-w-[1600px]`.

## States (required everywhere)
Loading skeletons · empty states · success/error/warning toasts · hover/active micro-interactions ·
disabled + validation error styling.

## Accessibility notes
Semantic headings, focus-visible rings (`ring-primary`), sufficient contrast on `#0A0A0A`, keyboard-operable
OTP inputs, and 21+/responsible-gambling messaging surfaced throughout.
