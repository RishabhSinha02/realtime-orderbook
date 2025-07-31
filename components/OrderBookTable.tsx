'use client';
import { useOrderBookSocket } from '@/hooks/useOrderBookSocket';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { Venue } from '@/app/page';

export default function OrderBookTable({ venue, symbol, depth }: { venue: Venue; symbol: string; depth: number }) {
  useOrderBookSocket(venue, symbol, depth);
  const book = useOrderBookStore((s) => s.books[venue]?.[symbol]);
  const sims = useOrderBookStore((s) => s.simulations).filter((o) => o.venue === venue && o.symbol === symbol);

  if (!book) return <p>Loading orderbook…</p>;

  // Find best bid/ask
  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;

  // Only show the most recent simulation for this venue/symbol
  const sim = sims.length > 0 ? sims[sims.length - 1] : null;

  // Build orderbook levels with simulated row inserted if needed
  let bids = [...book.bids];
  let asks = [...book.asks];
  let simRowIdx = -1;
  let insertedSimOrder = false;
  
  if (sim) {
    console.log('Simulated order:', sim);
    console.log('Original bids:', book.bids.slice(0, 5));
    console.log('Original asks:', book.asks.slice(0, 5));
    
    if (sim.side === 'buy') {
      simRowIdx = bids.findIndex((b) => b.price === sim.price);
      console.log('Buy order - exact match at index:', simRowIdx);
      if (simRowIdx === -1) {
        // Insert at correct sorted position
        simRowIdx = bids.findIndex((b) => b.price < sim.price);
        if (simRowIdx === -1) simRowIdx = bids.length;
        console.log('Buy order - inserting at index:', simRowIdx);
        bids = [
          ...bids.slice(0, simRowIdx),
          { price: sim.price, size: sim.qty },
          ...bids.slice(simRowIdx),
        ];
        insertedSimOrder = true;
      }
    } else {
      simRowIdx = asks.findIndex((a) => a.price === sim.price);
      console.log('Sell order - exact match at index:', simRowIdx);
      if (simRowIdx === -1) {
        simRowIdx = asks.findIndex((a) => a.price > sim.price);
        if (simRowIdx === -1) simRowIdx = asks.length;
        console.log('Sell order - inserting at index:', simRowIdx);
        asks = [
          ...asks.slice(0, simRowIdx),
          { price: sim.price, size: sim.qty },
          ...asks.slice(simRowIdx),
        ];
        insertedSimOrder = true;
      }
    }
    console.log('Final simRowIdx:', simRowIdx, 'insertedSimOrder:', insertedSimOrder);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800/50">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-800/60 backdrop-blur-sm sticky top-0 z-10">
            <tr className="border-b border-gray-700/50">
              <th className="text-green-400 font-semibold py-3 px-4 text-sm">Bid Size</th>
              <th className="text-green-400 font-semibold py-3 px-4 text-sm">Bid Price</th>
              <th className="text-red-400 font-semibold py-3 px-4 text-sm">Ask Price</th>
              <th className="text-red-400 font-semibold py-3 px-4 text-sm">Ask Size</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Array.from({ length: depth }).map((_, i) => {
              const bid = bids[i];
              const ask = asks[i];
              
              // Check if this row contains the simulated order
              const isSimBid = sim && sim.side === 'buy' && bid && (
                bid.price === sim.price || 
                (insertedSimOrder && simRowIdx === i && sim.side === 'buy')
              );
              const isSimAsk = sim && sim.side === 'sell' && ask && (
                ask.price === sim.price || 
                (insertedSimOrder && simRowIdx === i && sim.side === 'sell')
              );
              
              return (
                <tr
                  key={i}
                  className={
                    'transition-all duration-200 hover:bg-gray-800/30 border-b border-gray-800/20 ' +
                    (isSimBid || isSimAsk ? 'ring-2 ring-blue-400/50 ring-inset bg-blue-600/20 shadow-lg shadow-blue-500/10 ' : '')
                  }
                >
                  <td className={
                    'px-4 py-2 font-mono text-sm ' +
                    (isSimBid ? 'font-bold text-blue-100 bg-blue-600/30' : 'text-gray-300')
                  }>
                    {bid ? (isSimBid ? sim.qty.toFixed(3) : bid.size.toFixed(3)) : ''}
                  </td>
                  <td className={
                    'px-4 py-2 font-mono text-sm ' +
                    (isSimBid ? 'font-bold text-blue-100 bg-blue-600/30' : 'text-green-300')
                  }>
                    {bid ? bid.price.toFixed(1) : ''}
                  </td>
                  <td className={
                    'px-4 py-2 font-mono text-sm ' +
                    (isSimAsk ? 'font-bold text-blue-100 bg-blue-600/30' : 'text-red-300')
                  }>
                    {ask ? ask.price.toFixed(1) : ''}
                  </td>
                  <td className={
                    'px-4 py-2 font-mono text-sm ' +
                    (isSimAsk ? 'font-bold text-blue-100 bg-blue-600/30' : 'text-gray-300')
                  }>
                    {ask ? (isSimAsk ? sim.qty.toFixed(3) : ask.size.toFixed(3)) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}