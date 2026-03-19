import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: { default: 'ShelbyHub', template: '%s | ShelbyHub' },
  description: 'Your Web3 link-in-bio and decentralized file sharing hub, powered by Shelby Protocol.',
  keywords: ['web3', 'decentralized storage', 'link in bio', 'aptos', 'shelby protocol', 'blockchain'],
  authors: [{ name: 'ShelbyHub' }],
  creator: 'ShelbyHub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://shelbyhub.xyz'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'ShelbyHub',
    title: 'ShelbyHub — Web3 Link-in-Bio + File Storage',
    description: 'Share your links and files on the decentralized web.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShelbyHub',
    description: 'Web3 link-in-bio + decentralized file sharing.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#080c10',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
