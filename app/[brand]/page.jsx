import { getBrands, getModels, getBrandByName } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BrandSelector from './BrandSelector';

// Generate static params for all brands (SSG)
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({
    brand: brand.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  // Convert slug back to brand name (replace hyphens with spaces)
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) return {};

  return generateSeoMetadata({
    title: `${brand.name} Chiptuning`,
    description: `Professionele chiptuning voor ${brand.name}. Bekijk alle modellen en ontdek hoeveel extra vermogen uw ${brand.name} kan krijgen met Supreme Tuning.`,
    path: `/${brandSlug}`,
  });
}

export default async function BrandPage({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  // Convert slug back to brand name (replace hyphens with spaces)
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    notFound();
  }

  const models = await getModels(brand.id);

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <span className="current">{brand.name}</span>
        </nav>

        {/* Hero */}
        <div className="hero-section">
          <h1>{brand.name} Chiptuning</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Selecteer uw model, generatie en motor om de tuning mogelijkheden te bekijken
          </p>
        </div>

        {/* Client-side selector component */}
        <BrandSelector 
          brand={brand} 
          models={models}
        />
      </main>
    </>
  );
}

