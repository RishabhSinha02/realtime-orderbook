'use client';
import { useState } from 'react';
import OrderBookTable from '@/components/OrderBookTable';
import SimulationForm from '@/components/SimulationForm';
import DepthChart from '@/components/DepthChart';
import ImpactMetrics from '@/components/ImpactMetrics';

const VENUES = ['OKX', 'Bybit', 'Deribit'] as const;
export type Venue = (typeof VENUES)[number];

export default function HomePage() {
  const [venue, setVenue] = useState<Venue>('OKX');
  const [symbol, setSymbol] = useState('BTC-USDT');

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">
      {/* Left column – controls */}
      <div className="lg:col-span-1 space-y-4">
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
        <ImpactMetrics />
      </div>

      {/* Middle – orderbook */}
      <div className="lg:col-span-1">
        <OrderBookTable venue={venue} symbol={symbol} depth={15} />
      </div>

      {/* Right – depth chart */}
      <div className="lg:col-span-1">
        <DepthChart venue={venue} symbol={symbol} />
      </div>
    </div>
  );
}