import { getBrands } from '@/lib/data';
import Header from '@/components/Header';
import BrandGrid from '@/components/BrandGrid';
import HeroSection from '@/components/HeroSection';

// Force dynamic rendering - always fetch fresh data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Chiptuning Calculator | Supreme Tuning',
  description: 'Bereken direct hoeveel vermogen uw auto kan winnen met professionele chiptuning. Selecteer uw merk en ontdek de mogelijkheden.',
  openGraph: {
    title: 'Chiptuning Calculator | Supreme Tuning',
    description: 'Bereken direct hoeveel vermogen uw auto kan winnen met professionele chiptuning.',
  },
};

export default async function HomePage() {
  const brands = await getBrands();

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '40px 24px' }}>
        <HeroSection />

        {/* Brand Grid with Status Filter */}
        <BrandGrid brands={brands} />
      </main>
    </>
  );
}

