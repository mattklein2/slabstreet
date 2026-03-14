import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { UserProvider } from './components/UserProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlabStreet — Smart Collecting Starts Here',
  description: 'Sports card intelligence tools for collectors. Identify your pulls, find the best boxes, and learn the hobby.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0f1a' }}>
        <ThemeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
