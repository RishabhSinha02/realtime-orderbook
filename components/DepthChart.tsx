'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

import { useOrderBookStore } from '@/store/useOrderBookStore';
import { Venue } from '@/app/page';

export default function DepthChart({ venue, symbol }: { venue: Venue; symbol: string }) {
  const book = useOrderBookStore((s) => s.books[venue]?.[symbol]);
  const sim = useOrderBookStore((s) => s.simulations).filter((o) => o.venue === venue && o.symbol === symbol).slice(-1)[0];

  if (!book) return <p className="text-center">Depth chart loading…</p>;

  // Build cumulative depth arrays
  const bidsCum: number[] = [];
  const bidPrices: string[] = [];
  let sum = 0;
  for (const { price, size } of [...book.bids].reverse()) {
    sum += size;
    bidsCum.push(sum);
    bidPrices.push(price.toFixed(0));
  }

  const asksCum: number[] = [];
  const askPrices: string[] = [];
  sum = 0;
  for (const { price, size } of book.asks) {
    sum += size;
    asksCum.push(sum);
    askPrices.push(price.toFixed(0));
  }

  const data: ChartData<'line', (number | null)[], string> = {
  labels: [...bidPrices, ...askPrices],
  datasets: [
    {
      label: 'Bids',
      data: [...bidsCum, ...Array(askPrices.length).fill(null)],
      borderColor: 'rgb(34,197,94)',
      backgroundColor: 'rgba(34,197,94,0.15)',
      fill: 'origin',
      tension: 0.3,
    },
    {
      label: 'Asks',
      data: [...Array(bidPrices.length).fill(null), ...asksCum],
      borderColor: 'rgb(239,68,68)',
      backgroundColor: 'rgba(239,68,68,0.15)',
      fill: 'origin',
      tension: 0.3,
    },
  ],
};


  const textColor = '#e5e7eb'; // gray‑200
  const gridColor = '#374151'; // gray‑700

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // <-- Enable ChartJS legend
        labels: {
          color: textColor,
          font: { size: 14, weight: 'bold' },
          usePointStyle: true,
          padding: 20,
          boxWidth: 16,
          boxHeight: 16,
        },
        position: 'top' as const,
        align: 'center' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, maxTicksLimit: 6 },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  } as const;

  return (
    <div className="relative h-80 w-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-xl shadow-xl p-4 flex flex-col justify-end border border-gray-800/50 pb-12 pt-2">
      <Line data={data} options={{
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            ...options.plugins.legend,
            labels: {
              ...options.plugins.legend.labels,
              padding: 8, // Reduce legend label padding
            },
          },
        },
      }} />
      {sim && (
        <div className="absolute inset-x-0 bottom-3 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 text-blue-300 font-mono text-xs backdrop-blur-sm border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
            Simulated {sim.side} @ {sim.type === 'limit' ? sim.price : 'MKT'} qty {sim.qty}
          </div>
        </div>
      )}
    </div>
  );
}
