import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AppProviders } from './AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'AlgoCore · Cambridge 9618 Paper 1',
  description: 'Interactive bilingual Cambridge 9618 Paper 1 revision by AlgoCore Education.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-algocore-locale') === 'vi' ? 'vi' : 'en';
  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <AppProviders initialLocale={locale}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

