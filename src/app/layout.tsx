import type { Metadata, Viewport } from 'next';
import { Caveat, Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--f-serif',
  display: 'swap',
});
const caveat = Caveat({ subsets: ['latin'], variable: '--f-hand', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--f-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Bursdagsjakten',
  description: 'Ti brev til Regine',
  manifest: '/pwa/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/pwa/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/pwa/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/pwa/apple-touch-icon-180.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'Bursdagsjakten', statusBarStyle: 'default' },
  robots: { index: false, follow: false },
  // Next setter bare mobile-web-app-capable; eldre iOS vil ha Apple-varianten for fullskjerm fra hjemskjermen.
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#F2679A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${fraunces.variable} ${caveat.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
