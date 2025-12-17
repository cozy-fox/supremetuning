'use client';

import { BMWLogo, BMWMLogo, AudiLogo, AudiRSLogo, MercedesLogo, MercedesAMGLogo } from '@/components/BrandLogos';

/**
 * GroupLogo Component
 * Displays either a built-in brand logo or a custom uploaded logo
 * 
 * @param {string} logo - Logo identifier (built-in name like 'bmw-m' or data URL for custom)
 * @param {number} size - Size of the logo
 * @param {string} alt - Alt text for custom images
 */
export default function GroupLogo({ logo, size = 80, alt = 'Group logo' }) {
  if (!logo) return null;

  // Check if it's a custom uploaded logo (data URL)
  if (logo.startsWith('data:')) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={logo}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // Built-in logos - wrap in container for consistent sizing
  const LogoComponent = (() => {
    switch (logo) {
      case 'bmw-standard':
        return <BMWLogo size={size} />;
      case 'bmw-m':
        return <BMWMLogo size={size} />;
      case 'audi-standard':
        return <AudiLogo size={size} />;
      case 'audi-rs':
        return <AudiRSLogo size={size} />;
      case 'mercedes-standard':
        return <MercedesLogo size={size} />;
      case 'mercedes-amg':
        return <MercedesAMGLogo size={size} />;
      default:
        // Fallback: try to display as image URL
        return (
          <img
            src={logo}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        );
    }
  })();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {LogoComponent}
    </div>
  );
}

