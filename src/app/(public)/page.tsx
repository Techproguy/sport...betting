import { Hero } from '@/components/home/Hero';
import {
  SportsStrip, LiveTicker, PromotionsRow, FeaturedMatches, TrendingBets, Testimonials, CTASection,
} from '@/components/home/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SportsStrip />
      <LiveTicker />
      <FeaturedMatches />
      <PromotionsRow />
      <TrendingBets />
      <Testimonials />
      <CTASection />
    </>
  );
}
