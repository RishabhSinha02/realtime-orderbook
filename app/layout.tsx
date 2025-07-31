import '@/app/globals.css'; // or wherever your CSS file lives
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real‑Time Orderbook Viewer',
  description: 'Multi‑venue crypto orderbook with order simulation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-gray-950 text-gray-100'}>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}