import '@/app/globals.css'; // or wherever your CSS file lives
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real-Time Orderbook Viewer',
  description: 'Multi-venue cryptocurrency orderbook with real-time data and order simulation capabilities',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg?v=2" type="image/svg+xml" />
      </head>
      <body className={inter.className + ' bg-gray-950 text-gray-100'}>
        <main className="">{children}</main>
      </body>
    </html>
  );
}