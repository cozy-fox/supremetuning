'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import BrandCard from './BrandCard';
import { useLanguage } from './LanguageContext';

export default function BrandGrid({ brands }) {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('production'); // Default to production for end users

  // Filter brands based on status
  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    
    switch (statusFilter) {
      case 'production':
        return brands.filter(brand => brand.isTest !== true);
      case 'test':
        return brands.filter(brand => brand.isTest === true);
      case 'all':
      default:
        return brands;
    }
  }, [brands, statusFilter]);

  // Select dropdown style matching Options button style
  const selectStyle = {
    background: 'rgba(168, 176, 184, 0.1)',
    border: '1px solid rgba(168, 176, 184, 0.3)',
    borderRadius: '6px',
    color: 'rgb(168, 176, 184)',
    padding: '8px 14px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: '32px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgb(168, 176, 184)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    minWidth: '140px'
  };

  return (
    <div style={{ marginTop: '40px' }}>
      {/* Status Filter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '20px',
        gap: '12px',
        alignItems: 'center'
      }}>
        <label style={{ 
          color: 'rgb(168, 176, 184)', 
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {t('status') || 'Status'}:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all" style={{ background: '#1a1a1a' }}>{t('all') || 'All'}</option>
          <option value="production" style={{ background: '#1a1a1a' }}>{t('production') || 'Production'}</option>
          <option value="test" style={{ background: '#1a1a1a' }}>{t('test') || 'Test'}</option>
        </select>
      </div>

      {/* Brand Grid */}
      <div className="grid-brands">
        {filteredBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {/* No brands message */}
      {filteredBrands.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'rgb(168, 176, 184)'
        }}>
          {statusFilter === 'test' 
            ? (t('noTestBrands') || 'No test brands available')
            : statusFilter === 'production'
            ? (t('noProductionBrands') || 'No production brands available')
            : (t('noBrands') || 'No brands available')
          }
        </div>
      )}
    </div>
  );
}

