/**
 * SEO utilities for generating metadata
 */

const SITE_URL = process.env.SITE_URL || 'https://supremetuning.nl';
const SITE_NAME = process.env.SITE_NAME || 'Supreme Tuning';

export function generateMetadata({
  title,
  description,
  path = '',
  image = '/og-image.jpg',
  type = 'website',
}) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'nl_NL',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate structured data for vehicles (JSON-LD)
export function generateVehicleSchema({
  brand,
  model,
  type,
  engine,
  stages,
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brand} ${model} ${type} Chiptuning`,
    description: `Chiptuning voor ${brand} ${model} ${type}. Verhoog het vermogen van uw ${engine || 'motor'} met professionele tuning.`,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    category: 'Automotive Tuning Service',
    offers: stages?.map(stage => ({
      '@type': 'Offer',
      name: stage.stageName,
      price: stage.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    })) || [],
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };
}

// Create URL-safe slug
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Decode URL slug back to name
export function unslugify(slug) {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

