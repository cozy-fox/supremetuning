import { getBrands, getModels, getBrandByName, getGroups, brandHasGroups } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import GroupSelector from './GroupSelector';
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

/**
 * Get brand groups configuration from database
 * Returns serialized groups for client component
 * hasGroups will be false if brand only has a Standard group (no selector shown)
 */
async function getBrandGroupsForClient(brandId) {
  const hasPerformanceGroups = await brandHasGroups(brandId);
  const groups = await getGroups(brandId);

  // If no performance groups, get the default group ID for auto-selection
  let defaultGroupId = null;
  if (!hasPerformanceGroups && groups.length > 0) {
    defaultGroupId = groups[0].id;
  }

  // Serialize groups for client (already serialized from data.js, just format)
  const serializedGroups = groups.map(group => ({
    id: group.id,
    name: group.name,
    displayName: group.isPerformance ? group.name : 'Standard',
    description: group.description || '',
    tagline: group.tagline || null,
    color: group.color || null,
    icon: group.icon || null,
    logo: group.logo || null,
    isPerformance: group.isPerformance || false,
    order: group.order || 0,
  }));

  return {
    hasGroups: hasPerformanceGroups, // Only true if performance groups exist
    groups: serializedGroups,
    defaultGroupId, // For auto-selecting when no performance groups
  };
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
  const brandGroups = await getBrandGroupsForClient(brand.id);

  return (
    <>
      <Header />
      {/* Full-page Group Selection - then shows model selector */}
      <GroupSelector
        brand={brand}
        groups={brandGroups.groups}
        models={models}
        brandGroups={brandGroups}
      />
    </>
  );
}

