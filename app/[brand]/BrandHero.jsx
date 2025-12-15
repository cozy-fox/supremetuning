'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function BrandHero({ brandName, hasGroups }) {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <h1>{brandName} Chiptuning</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
        {hasGroups ? t('selectGroupFirst') : t('selectModelGeneration')}
      </p>
    </div>
  );
}

