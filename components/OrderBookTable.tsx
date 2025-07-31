'use client';
import { useEffect } from 'react';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket';
import { Venue } from '@/app/page';

export default function OrderBookTable({ venue, symbol, depth }: { venue: Venue; symbol: string; depth: number }) {
  useOrderBookSocket(venue, symbol, depth);
  const book = useOrderBookStore((s) => s.books[venue]?.[symbol]);

  // Auto‑scroll to middle on update (optional)
  useEffect(() => {
    // TODO: implement if needed
  }, [book]);

  if (!book) return <p>Loading orderbook…</p>;

  return (
    <table className="w-full text-right border-collapse">
      <thead>
        <tr>
          <th className="text-green-400">Bid Size</th>
          <th className="text-green-400">Bid Price</th>
          <th className="text-red-400">Ask Price</th>
          <th className="text-red-400">Ask Size</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {Array.from({ length: depth }).map((_, i) => {
          const bid = book.bids[i];
          const ask = book.asks[i];
          return (
            <tr key={i} className="odd:bg-gray-800 even:bg-gray-900">
              <td className="text-green-300">{bid?.size.toFixed(3)}</td>
              <td className="text-green-300">{bid?.price.toFixed(1)}</td>
              <td className="text-red-300">{ask?.price.toFixed(1)}</td>
              <td className="text-red-300">{ask?.size.toFixed(3)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
