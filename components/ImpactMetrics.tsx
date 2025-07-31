'use client';
import { useOrderBookStore } from '@/store/useOrderBookStore';

export default function ImpactMetrics() {
  const metrics = useOrderBookStore((s) => s.lastMetrics);
  if (!metrics) return null;
  return (
    <div className="bg-gray-800 p-2 rounded text-sm space-y-1">
      <p><strong>Fill:</strong> {metrics.fillQty.toFixed(4)} ({metrics.fillPct}% of order)</p>
      <p><strong>Avg Price:</strong> {metrics.avgFillPrice}</p>
      <p><strong>Slippage:</strong> {metrics.slippagePct}%</p>
    </div>
  );
}