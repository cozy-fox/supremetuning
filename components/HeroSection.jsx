'use client';

import { Zap } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <Zap size={32} color="var(--primary)" />
        <h1>{t('chiptuningCalculator')}</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
        {t('selectBrand')}
      </p>
    </div>
  );
}

