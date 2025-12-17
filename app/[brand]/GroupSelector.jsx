'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import GroupLogo from '@/components/GroupLogo';
import BrandSelector from './BrandSelector';

/**
 * Full-page Group Selection with Large Professional Cards
 * After selection, shows model/generation/engine selector
 * Clean, monochrome design with official brand logos
 */
export default function GroupSelector({ brand, groups, models, brandGroups }) {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  // If only one group exists, auto-select it and show model selector directly
  const effectiveSelectedGroup = selectedGroup || (groups.length === 1 ? groups[0] : null);

  // Get the appropriate logo for each group
  const getGroupLogo = (group) => {
    const logoSize = 200; // Increased from 120 to 200

    // If group has a custom logo, use it
    if (group.logo) {
      return <GroupLogo logo={group.logo} size={logoSize} alt={group.displayName || group.name} />;
    }

    // Fallback to default brand logo based on group name
    const brandName = brand.name.toUpperCase();
    const groupName = (group.name || '').toUpperCase();

    let logoIdentifier = null;

    if (brandName === 'BMW') {
      logoIdentifier = groupName === 'M' ? 'bmw-m' : 'bmw-standard';
    } else if (brandName === 'AUDI') {
      logoIdentifier = groupName === 'RS' ? 'audi-rs' : 'audi-standard';
    } else if (brandName === 'MERCEDES' || brandName === 'MERCEDES-BENZ') {
      logoIdentifier = groupName === 'AMG' ? 'mercedes-amg' : 'mercedes-standard';
    }

    return logoIdentifier ? <GroupLogo logo={logoIdentifier} size={logoSize} alt={group.displayName || group.name} /> : null;
  };

  // If a group is selected (or only one group exists), show the model selector
  if (effectiveSelectedGroup) {
    const filteredModels = models.filter(m => m.groupId === effectiveSelectedGroup.id);

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Back button - only show if there are multiple groups and user manually selected one */}
          {groups.length > 1 && selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '24px',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← {t('backToGroups') || 'Back to Groups'}
            </button>
          )}

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
              {brand.name} {groups.length > 1 ? (effectiveSelectedGroup.displayName || effectiveSelectedGroup.name) : ''}
            </h1>
            {effectiveSelectedGroup.description && (
              <p style={{ fontSize: '1.1rem', color: '#a8b0b8', fontWeight: '300' }}>
                {effectiveSelectedGroup.description}
              </p>
            )}
          </div>

          {/* Model Selector */}
          <BrandSelector
            brand={brand}
            models={filteredModels}
            brandGroups={brandGroups}
            selectedGroupId={effectiveSelectedGroup.id}
            hideGroupSelector={true}
          />
        </div>
      </div>
    );
  }

  // Show group selection
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '80px 20px 40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            {brand.name}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#a8b0b8',
            fontWeight: '300'
          }}>
            {t('selectYourSeries') || 'Select Your Series'}
          </p>
        </div>

        {/* Group Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px',
          padding: '20px'
        }}>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '2px solid #333',
                borderRadius: '16px',
                padding: '60px 40px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px',
                minHeight: '320px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Logo */}
              <div style={{
                width: '280px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                {getGroupLogo(group)}
              </div>

              {/* Group Name */}
              <div style={{
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '0.5px'
                }}>
                  {group.displayName || group.name}
                </h2>
                {group.description && (
                  <p style={{
                    fontSize: '1rem',
                    color: '#a8b0b8',
                    lineHeight: '1.6',
                    fontWeight: '300'
                  }}>
                    {group.description}
                  </p>
                )}
              </div>

              {/* Subtle accent line */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent 0%, #555 50%, transparent 100%)'
              }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

