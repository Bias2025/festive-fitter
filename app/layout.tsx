import type { Metadata, Viewport } from 'next';
import './globals.css';
import RegisterServiceWorker from './register-sw';

export const metadata: Metadata = {
  title: 'Style My Season',
  description:
    'Try on Halloween and Christmas outfits, sweaters, and pyjamas in a photo before you commit. A StyleMyCrown project.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico']
  },
  appleWebApp: {
    capable: true,
    title: 'Style My Season',
    statusBarStyle: 'black-translucent'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
