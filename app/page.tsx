'use client';
import { useState } from 'react';
import OrderBookTable from '@/components/OrderBookTable';
import SimulationForm from '@/components/SimulationForm';

const VENUES = ['OKX', 'Bybit', 'Deribit'] as const;
export type Venue = (typeof VENUES)[number];

export default function Home() {
  const [venue, setVenue] = useState<Venue>('OKX');
  const [symbol, setSymbol] = useState('BTC-USDT');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Controls */}
      <div className="space-y-2">
        <select
          value={venue}
          onChange={(e) => setVenue(e.target.value as Venue)}
          className="w-full rounded bg-gray-800 p-2"
        >
          {VENUES.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full rounded bg-gray-800 p-2"
        />
        <SimulationForm venue={venue} symbol={symbol} />
      </div>

      {/* Orderbook */}
      <OrderBookTable venue={venue} symbol={symbol} depth={15} />
    </div>
  );
}