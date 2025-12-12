import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { LanguageProvider } from '@/components/LanguageContext';

export const metadata = {
  title: {
    default: 'Supreme Tuning | Professionele Chiptuning Nederland',
    template: '%s | Supreme Tuning',
  },
  description: 'Professionele chiptuning voor alle automerken. Verhoog het vermogen en koppel van uw auto met Supreme Tuning. Gespecialiseerd in BMW, Audi, Mercedes en meer.',
  keywords: ['chiptuning', 'tuning', 'auto tuning', 'vermogen', 'koppel', 'Nederland', 'BMW tuning', 'Audi tuning', 'Mercedes tuning'],
  authors: [{ name: 'Supreme Tuning' }],
  creator: 'Supreme Tuning',
  metadataBase: new URL(process.env.SITE_URL || 'https://supremetuning.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: '/',
    siteName: 'Supreme Tuning',
    title: 'Supreme Tuning | Professionele Chiptuning Nederland',
    description: 'Professionele chiptuning voor alle automerken. Verhoog het vermogen en koppel van uw auto.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Supreme Tuning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supreme Tuning | Professionele Chiptuning',
    description: 'Professionele chiptuning voor alle automerken.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/assets/logo.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" data-theme="dark" data-scroll-behavior="smooth" className="notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="notranslate" translate="no">
        <LanguageProvider>
          <AuthProvider>
            <div id="root">
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

