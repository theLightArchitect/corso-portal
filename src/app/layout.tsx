/**
 * Root Layout with Authentication Providers
 */

import React from 'react';
import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-modern',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-biblical',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'C0RS0 Portal - Sacred Authentication',
  description: 'C0RS0 Platform Customer Portal with Biblical Security',
  keywords: ['C0RS0', 'AI Platform', 'Biblical Security', 'Customer Portal'],
  authors: [{ name: 'C0RS0 Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Private portal
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="font-modern antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}