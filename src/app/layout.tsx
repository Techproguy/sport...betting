import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Technoestro Sportsbook — Bet Smarter',
  description:
    'The next-generation sportsbook by Technoestro Solutions. Live betting, same-game parlays, instant payouts, and premium odds across NFL, NBA, MLB, Soccer and more.',
  keywords: ['sportsbook', 'betting', 'NFL', 'NBA', 'live betting', 'parlay', 'Technoestro'],
  authors: [{ name: 'Technoestro Solutions' }],
  openGraph: {
    title: 'Technoestro Sportsbook',
    description: 'Bet smarter. Premium odds, live betting, instant payouts.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
