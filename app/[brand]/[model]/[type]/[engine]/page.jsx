import { getBrands, getModels, getTypes, getEngines, getStages, getEngineById } from '@/lib/data';
import { generateMetadata as generateSeoMetadata, generateVehicleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ResultsClient from './ResultsClient';

// Dynamic metadata for SEO - this is crucial for search engines
export async function generateMetadata({ params }) {
  const { brand, model, type, engine } = await params;
  
  const brandName = decodeURIComponent(brand);
  const modelName = decodeURIComponent(model);
  const typeName = decodeURIComponent(type);
  
  const engineData = await getEngineById(engine);
  const stages = await getStages(engine);
  
  const maxHp = stages.length > 0 ? Math.max(...stages.map(s => s.tunedHp || 0)) : 0;
  
  return generateSeoMetadata({
    title: `${brandName} ${modelName} ${typeName} Chiptuning`,
    description: `Chiptuning voor ${brandName} ${modelName} ${typeName}${engineData ? ` ${engineData.name}` : ''}. ${maxHp > 0 ? `Tot ${maxHp} PK mogelijk.` : ''} Bekijk alle stages en prijzen bij Supreme Tuning.`,
    path: `/${brand}/${model}/${type}/${engine}`,
  });
}

export default async function ResultsPage({ params }) {
  const { brand, model, type, engine } = await params;
  
  const brandName = decodeURIComponent(brand);
  const modelName = decodeURIComponent(model);
  const typeName = decodeURIComponent(type);
  
  // Fetch data server-side for SEO
  const stages = await getStages(engine);
  const engineData = await getEngineById(engine);
  
  if (!engineData) {
    notFound();
  }

  // Generate structured data for SEO
  const vehicleSchema = generateVehicleSchema({
    brand: brandName,
    model: modelName,
    type: typeName,
    engine: engineData?.name,
    stages,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: brandName, url: `/${brand}` },
    { name: modelName, url: `/${brand}/${model}` },
    { name: typeName },
  ]);

  const vehicleInfo = {
    brand: brandName,
    model: modelName,
    type: typeName,
    engine: engine,
    engineDescription: engineData?.description || '',
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="results-page">
        <Header />
        <main className="container">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href={`/${brand}`}>{brandName}</a>
            <span>›</span>
            <span>{modelName}</span>
            <span>›</span>
            <span className="current">{typeName}</span>
          </nav>

          {/* Client-side interactive results */}
          <ResultsClient 
            stages={stages}
            vehicleInfo={vehicleInfo}
            engineData={engineData}
          />
        </main>
      </div>
    </>
  );
}

