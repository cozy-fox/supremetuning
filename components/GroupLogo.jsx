'use client';

import { BMWLogo, BMWMLogo, AudiLogo, AudiRSLogo, MercedesLogo, MercedesAMGLogo } from '@/components/BrandLogos';

/**
 * GroupLogo Component
 * Displays either a built-in brand logo or a custom uploaded logo
 *
 * @param {string} logo - Logo identifier (built-in name like 'bmw-m' or data URL for custom)
 * @param {number} size - Size of the logo (used as reference height)
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

  // Logo size adjustments to make all logos appear visually consistent
  // These multipliers compensate for different aspect ratios and visual weight
  const getAdjustedSize = (logoType) => {
    switch (logoType) {
      case 'bmw-standard':
        return size * 1.0;     // Square logo, baseline
      case 'bmw-m':
        return size * 0.85;    // Wide logo (1.5:1), reduce to fit
      case 'audi-standard':
        return size * 0.65;    // Very wide logo (2.2:0.7), reduce significantly
      case 'audi-rs':
        return size * 0.85;    // Wide logo (1.4:1), reduce to fit
      case 'mercedes-standard':
        return size * 1.0;     // Square logo, baseline
      case 'mercedes-amg':
        return size * 0.75;    // Widest logo (1.8:1), reduce more to fit
      default:
        return size;
    }
  };

  // Built-in logos - wrap in container for consistent sizing
  const adjustedSize = getAdjustedSize(logo);

  const LogoComponent = (() => {
    switch (logo) {
      case 'bmw-standard':
        return <BMWLogo size={adjustedSize} />;
      case 'bmw-m':
        return <BMWMLogo size={adjustedSize} />;
      case 'audi-standard':
        return <AudiLogo size={adjustedSize} />;
      case 'audi-rs':
        return <AudiRSLogo size={adjustedSize} />;
      case 'mercedes-standard':
        return <MercedesLogo size={adjustedSize} />;
      case 'mercedes-amg':
        return <MercedesAMGLogo size={adjustedSize} />;
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

