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
        labels: { color: textColor },
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
    <div className="relative h-64 w-full bg-gray-900 rounded">
      <Line data={data} options={options} />
      {sim && (
        <p className="absolute inset-x-0 bottom-1 text-center text-xs text-gray-300">
          Simulated {sim.side} @ {sim.type === 'limit' ? sim.price : 'MKT'} qty {sim.qty}
        </p>
      )}
    </div>
  );
}
