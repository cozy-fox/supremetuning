import { getAllVehicles } from '@/lib/data';

const SITE_URL = process.env.SITE_URL || 'https://supremetuning.nl';

export default async function sitemap() {
  const { brands, models, types, engines } = await getAllVehicles();
  
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Brand pages
  const brandPages = brands.map((brand) => ({
    url: `${SITE_URL}/${brand.name.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Model pages - these are the most important for SEO
  const vehiclePages = [];
  
  for (const engine of engines) {
    const type = types.find(t => t.id === engine.typeId);
    if (!type) continue;
    
    const model = models.find(m => m.id === type.modelId);
    if (!model) continue;
    
    const brand = brands.find(b => b.id === model.brandId);
    if (!brand) continue;

    vehiclePages.push({
      url: `${SITE_URL}/${brand.name.toLowerCase()}/${encodeURIComponent(model.name)}/${encodeURIComponent(type.name)}/${engine.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return [...staticPages, ...brandPages, ...vehiclePages];
}

