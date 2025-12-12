'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function BrandCard({ brand }) {
  const [imgError, setImgError] = useState(false);

  // URL-safe brand name (replace spaces with hyphens)
  const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/${brandSlug}`}
      className="brand-card"
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!imgError ? (
          <Image
            src={`/assets/brand_logo/${brand.name}.png`}
            alt={brand.name}
            width={80}
            height={80}
            style={{ 
              objectFit: 'contain',
              filter: 'brightness(0.9)',
              transition: 'filter 0.3s ease',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#a8b0b8',
          }}>
            {brand.name.charAt(0)}
          </div>
        )}
        <p style={{
          marginTop: '12px',
          fontSize: '0.95rem',
          fontWeight: '700',
          color: '#0a0a0a',
          letterSpacing: '1.2px',
          textShadow: '0 1px 3px rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
        }}>
          {brand.name}
        </p>
      </div>
    </Link>
  );
}

