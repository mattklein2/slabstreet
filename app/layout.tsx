import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlabStreet — Coming Soon',
  description: 'Something new is coming to SlabStreet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Fonts loaded via @import in globals.css — preconnect only here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0f1a' }}>
        {children}
      </body>
    </html>
  );
}
