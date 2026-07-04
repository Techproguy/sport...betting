import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BetSlipMobile } from '@/components/sportsbook/BetSlip';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BetSlipMobile />
    </div>
  );
}
