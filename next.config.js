/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Use Sharp for image optimization (required in production)
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },

  // SEO: Trailing slashes for cleaner URLs
  trailingSlash: false,

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://supremetuning.nl',
    SITE_NAME: 'Supreme Tuning',
  },
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://supremetuning.nl;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;

