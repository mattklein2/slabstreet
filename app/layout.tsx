import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import NavShell from './components/layout/NavShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlabStreet — Card Market Intelligence',
  description: 'Bloomberg Terminal for sports card collectors. Real-time Slab Scores, market data, and investment signals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('slabstreet-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Fonts loaded via @import in globals.css — preconnect only here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>
          <NavShell />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
