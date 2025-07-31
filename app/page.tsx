'use client';
import { useState, useMemo } from 'react';
import OrderBookTable from '@/components/OrderBookTable';
import SimulationForm from '@/components/SimulationForm';
import DepthChart from '@/components/DepthChart';
import ImpactMetrics from '@/components/ImpactMetrics';
import { FaExchangeAlt, FaChartBar, FaClipboardList, FaBitcoin, FaGlobe } from 'react-icons/fa';

const VENUES = ['OKX', 'Bybit', 'Deribit'] as const;
export type Venue = (typeof VENUES)[number];

// Orderbook Logo Component
const OrderbookLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background */}
    <rect width="32" height="32" fill="#1f2937" rx="4"/>
    
    {/* Bid side (green bars) */}
    <rect x="4" y="8" width="2" height="8" fill="#10b981" rx="1"/>
    <rect x="7" y="10" width="2" height="6" fill="#10b981" rx="1"/>
    <rect x="10" y="12" width="2" height="4" fill="#10b981" rx="1"/>
    
    {/* Ask side (red bars) */}
    <rect x="26" y="16" width="2" height="8" fill="#ef4444" rx="1"/>
    <rect x="23" y="18" width="2" height="6" fill="#ef4444" rx="1"/>
    <rect x="20" y="20" width="2" height="4" fill="#ef4444" rx="1"/>
    
    {/* Center line */}
    <line x1="16" y1="4" x2="16" y2="28" stroke="#6b7280" strokeWidth="1"/>
    
    {/* Center dot */}
    <circle cx="16" cy="16" r="2" fill="#3b82f6"/>
  </svg>
);

// Available symbols for each venue
const VENUE_SYMBOLS: Record<Venue, string[]> = {
  'OKX': [
    'BTC-USDT',
    'ETH-USDT', 
    'SOL-USDT',
    'ADA-USDT',
    'DOT-USDT',
    'LINK-USDT',
    'MATIC-USDT',
    'AVAX-USDT',
    'UNI-USDT',
    'ATOM-USDT'
  ],
  'Bybit': [
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT', 
    'ADAUSDT',
    'DOTUSDT',
    'LINKUSDT',
    'MATICUSDT',
    'AVAXUSDT',
    'UNIUSDT',
    'ATOMUSDT'
  ],
  'Deribit': [
    'BTC-PERPETUAL',
    'ETH-PERPETUAL',
    'SOL-PERPETUAL',
    'ADA-PERPETUAL', 
    'DOT-PERPETUAL',
    'LINK-PERPETUAL',
    'MATIC-PERPETUAL',
    'AVAX-PERPETUAL',
    'UNI-PERPETUAL',
    'ATOM-PERPETUAL'
  ]
};

export default function HomePage() {
  const [venue, setVenue] = useState<Venue>('OKX');
  const [symbol, setSymbol] = useState('BTC-USDT');

  // Get available symbols for the selected venue
  const availableSymbols = useMemo(() => VENUE_SYMBOLS[venue], [venue]);

  // Update symbol when venue changes to a valid symbol for the new venue
  const handleVenueChange = (newVenue: Venue) => {
    setVenue(newVenue);
    const newSymbols = VENUE_SYMBOLS[newVenue];
    // Try to find a similar symbol or default to the first one
    const similarSymbol = newSymbols.find(s => 
      s.includes('BTC') || s.includes('ETH')
    ) || newSymbols[0];
    setSymbol(similarSymbol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrderbookLogo size={32} />
              <h1 className="text-xl font-bold text-white">Real-Time Orderbook</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Market Info Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                <FaExchangeAlt className="text-green-400" />
                <select
                  value={venue}
                  onChange={(e) => handleVenueChange(e.target.value as Venue)}
                  className="bg-transparent text-white font-medium focus:outline-none"
                >
                  {VENUES.map((v) => (
                    <option key={v} className="bg-gray-800">{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-sm">Symbol:</span>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-transparent text-white font-mono focus:outline-none min-w-0"
                >
                  {availableSymbols.map((s) => (
                    <option key={s} className="bg-gray-800">{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Real-time data from {venue}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Panel - Order Simulation */}
          <div className="xl:col-span-3 order-1 xl:order-1">
            <div className="bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FaClipboardList className="text-blue-400 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Order Simulation</h2>
                  <p className="text-sm text-gray-400">Test your trading strategy</p>
                </div>
              </div>
              <SimulationForm venue={venue} symbol={symbol} />
            </div>
          </div>

          {/* Center Panel - Orderbook */}
          <div className="xl:col-span-5 order-2 xl:order-2">
            <div className="bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-gray-800/50 backdrop-blur-sm h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <FaExchangeAlt className="text-green-400 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Live Orderbook</h2>
                  <p className="text-sm text-gray-400">Real-time market depth</p>
                </div>
              </div>
              <OrderBookTable venue={venue} symbol={symbol} depth={15} />
            </div>
          </div>

          {/* Right Panel - Market Depth Chart & Impact Metrics */}
          <div className="xl:col-span-4 order-3 xl:order-3 space-y-6">
            {/* Market Depth Chart */}
            <div className="bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FaChartBar className="text-purple-400 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Market Depth</h2>
                  <p className="text-sm text-gray-400">Price distribution</p>
                </div>
              </div>
              <DepthChart venue={venue} symbol={symbol} />
            </div>
            
            {/* Impact Metrics */}
            <div>
              <ImpactMetrics />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}