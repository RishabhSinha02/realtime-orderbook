'use client';
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { Venue } from '@/app/page';

export default function OrderBookTable({ venue, symbol, depth }: { venue: Venue; symbol: string; depth: number }) {
  useOrderBookSocket(venue, symbol, depth);
  const book = useOrderBookStore((s) => s.books[venue]?.[symbol]);
  const sims = useOrderBookStore((s) => s.simulations).filter((o) => o.venue === venue && o.symbol === symbol);

  if (!book) return <p>Loading orderbook…</p>;

  // Build quick lookup: price → simulated side
  const simMap = new Map<number, 'buy' | 'sell'>();
  for (const o of sims) simMap.set(o.price, o.side);

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
          const isBidSim = bid && simMap.get(bid.price) === 'buy';
          const isAskSim = ask && simMap.get(ask.price) === 'sell';
          return (
            <tr key={i} className="odd:bg-gray-800 even:bg-gray-900">
              <td className={isBidSim ? 'bg-blue-600/40' : ''}>{bid?.size.toFixed(3)}</td>
              <td className={isBidSim ? 'bg-blue-600/40' : ''}>{bid?.price.toFixed(1)}</td>
              <td className={isAskSim ? 'bg-blue-600/40' : ''}>{ask?.price.toFixed(1)}</td>
              <td className={isAskSim ? 'bg-blue-600/40' : ''}>{ask?.size.toFixed(3)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}