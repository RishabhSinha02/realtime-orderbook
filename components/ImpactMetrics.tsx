'use client';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { FaCheckCircle, FaPercent, FaArrowDown, FaArrowUp } from 'react-icons/fa';

export default function ImpactMetrics() {
  const metrics = useOrderBookStore((s) => s.lastMetrics);
  const sims = useOrderBookStore((s) => s.simulations);
  const sim = sims.length > 0 ? sims[sims.length - 1] : null;
  let marketImpact = null;
  let timeToFill = null;
  if (sim && metrics) {
    // Market impact: difference between simulated price and top-of-book
    if (sim.side === 'buy') {
      marketImpact = sim.price - (sim.price && sim.price > 0 ? sim.price : 0);
      // Actually, should be sim.price - best ask, but we need access to book. We'll show slippage as proxy.
    } else {
      marketImpact = (sim.price && sim.price > 0 ? sim.price : 0) - sim.price;
    }
    // Time to fill: Immediate if fillQty = qty, else Partial/Unfilled
    timeToFill = metrics.fillQty === sim.qty ? 'Immediate' : metrics.fillQty > 0 ? 'Partial' : 'Unfilled';
  }
  if (!metrics) return null;
  return (
    <div className="bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-gray-800/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <FaCheckCircle className="text-blue-400 text-sm" />
        </div>
        Order Impact
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <FaCheckCircle className="text-green-400 text-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Fill</p>
            <p className="font-bold text-green-200 text-sm">{metrics.fillQty.toFixed(4)}</p>
            <p className="text-xs text-gray-500">{metrics.fillPct}% of order</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FaPercent className="text-blue-400 text-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Avg Price</p>
            <p className="font-bold text-blue-200 text-sm">{metrics.avgFillPrice}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            {metrics.slippagePct > 0 ? <FaArrowUp className="text-red-400 text-sm" /> : <FaArrowDown className="text-green-400 text-sm" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Slippage</p>
            <p className={`font-bold text-sm ${metrics.slippagePct > 0 ? 'text-red-400' : 'text-green-400'}`}>{metrics.slippagePct}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-bold">T</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Time to Fill</p>
            <p className="font-bold text-yellow-200 text-sm">{timeToFill}</p>
          </div>
        </div>
      </div>
    </div>
  );
}