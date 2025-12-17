'use client';

/**
 * Professional Brand Logos - High Quality SVG
 * Accurate representations of official brand logos
 */

// BMW Standard Logo - Monochrome professional design
export function BMWLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bmwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#bmwGrad)" strokeWidth="3"/>

      {/* Inner circle border */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#bmwGrad)" strokeWidth="2"/>

      {/* Four quadrants - monochrome */}
      <path d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z" fill="rgba(192, 192, 192, 0.3)"/>
      <path d="M 90 50 A 40 40 0 0 1 50 90 L 50 50 Z" fill="rgba(232, 232, 232, 0.5)"/>
      <path d="M 50 90 A 40 40 0 0 1 10 50 L 50 50 Z" fill="rgba(192, 192, 192, 0.3)"/>
      <path d="M 10 50 A 40 40 0 0 1 50 10 L 50 50 Z" fill="rgba(232, 232, 232, 0.5)"/>

      {/* Center circle */}
      <circle cx="50" cy="50" r="8" fill="url(#bmwGrad)"/>

      {/* BMW Text */}
      <text
        x="50"
        y="55"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="url(#bmwGrad)"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        BMW
      </text>
    </svg>
  );
}

// BMW M Logo - Professional monochrome M design
export function BMWMLogo({ size = 80 }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F0F0F0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#D0D0D0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B0B0B0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background subtle stripes - monochrome */}
      <rect x="0" y="0" width="150" height="10" fill="rgba(192, 192, 192, 0.2)"/>
      <rect x="0" y="10" width="150" height="10" fill="rgba(160, 160, 160, 0.2)"/>
      <rect x="0" y="20" width="150" height="10" fill="rgba(128, 128, 128, 0.2)"/>

      {/* Large M Text */}
      <text
        x="75"
        y="75"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="70"
        fontWeight="900"
        fill="url(#mGrad)"
        stroke="rgba(100, 100, 100, 0.5)"
        strokeWidth="1"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        M
      </text>

      {/* Underline */}
      <rect x="20" y="90" width="110" height="5" fill="url(#mGrad)" opacity="0.7"/>
    </svg>
  );
}

// Audi Standard Logo - Four interlocking rings (monochrome professional)
export function AudiLogo({ size = 80 }) {
  return (
    <svg width={size * 2.2} height={size * 0.7} viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="audiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Four interlocking rings with gradient */}
      <circle cx="35" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="80" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="125" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="170" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
    </svg>
  );
}

// Audi RS Logo - Professional monochrome RS design
export function AudiRSLogo({ size = 80 }) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F0F0F0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#D0D0D0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B0B0B0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* RS Text */}
      <text
        x="70"
        y="65"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="75"
        fontWeight="900"
        fill="url(#rsGrad)"
        stroke="rgba(100, 100, 100, 0.5)"
        strokeWidth="1"
        letterSpacing="5"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        RS
      </text>

      {/* Underline */}
      <rect x="15" y="90" width="110" height="5" fill="url(#rsGrad)" opacity="0.7"/>
    </svg>
  );
}

// Mercedes-Benz Standard Logo - Three-pointed star (professional monochrome)
export function MercedesLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#mbGrad)" strokeWidth="3"/>

      {/* Three-pointed star */}
      <path
        d="M 50 10 L 50 50 M 50 50 L 15 75 M 50 50 L 85 75"
        stroke="url(#mbGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Inner circle */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#mbGrad)" strokeWidth="2"/>
    </svg>
  );
}

// Mercedes-AMG Logo - AMG text with silver/black styling
export function MercedesAMGLogo({ size = 80 }) {
  return (
    <svg width={size * 1.8} height={size} viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="amgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* AMG Text */}
      <text
        x="10"
        y="75"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="65"
        fontWeight="900"
        fill="url(#amgGrad)"
        stroke="#1a1a1a"
        strokeWidth="2"
        letterSpacing="2"
      >
        AMG
      </text>
      
      {/* Underline */}
      <rect x="10" y="85" width="160" height="6" fill="url(#amgGrad)"/>
    </svg>
  );
}

