export interface FillMetrics {
  fillQty: number; // how much will fill immediately
  fillPct: number; // % of qty
  avgFillPrice: number; // VWAP of fill
  slippagePct: number; // vs top‑of‑book price
}

import { OrderBookSnapshot, SimulatedOrder } from '../types';

export function calcFill(order: SimulatedOrder, book: OrderBookSnapshot): FillMetrics {
  const sideLevels = order.side === 'buy' ? book.asks : book.bids; // we hit the opposite side
  let remaining = order.qty;
  let cost = 0;

  for (const { price, size } of sideLevels) {
    if (remaining <= 0) break;
    const traded = Math.min(size, remaining);
    cost += traded * price;
    remaining -= traded;
  }

  const filledQty = order.qty - remaining;
  const topPrice = sideLevels[0]?.price ?? order.price;
  const avgPrice = filledQty ? cost / filledQty : 0;
  const slippagePct = order.side === 'buy'
    ? (avgPrice - topPrice) / topPrice * 100
    : (topPrice - avgPrice) / topPrice * 100;

  return {
    fillQty: filledQty,
    fillPct: +(filledQty / order.qty * 100).toFixed(2),
    avgFillPrice: +avgPrice.toFixed(2),
    slippagePct: +slippagePct.toFixed(3),
  };
}