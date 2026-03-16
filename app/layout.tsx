import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { UserProvider } from './components/UserProvider';
import { WebsiteSchema } from './components/StructuredData';
import Nav from './components/layout/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SlabStreet — Smart Collecting Starts Here',
    template: '%s | SlabStreet',
  },
  description: 'Free sports card tools for collectors. Identify cards, check sold prices, find shows, and learn the hobby. NBA, NFL, MLB, F1, WNBA.',
  metadataBase: new URL('https://slabstreet.com'),
  openGraph: {
    type: 'website',
    siteName: 'SlabStreet',
    title: 'SlabStreet — Smart Collecting Starts Here',
    description: 'Free sports card tools for collectors. Identify cards, check sold prices, find shows, and learn the hobby.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlabStreet — Smart Collecting Starts Here',
    description: 'Free sports card tools for collectors. Identify cards, check sold prices, find shows, and learn the hobby.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://slabstreet.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <WebsiteSchema />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0f1a' }}>
        <ThemeProvider>
          <UserProvider>
            <Nav />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
