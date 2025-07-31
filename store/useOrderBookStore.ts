import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OrderBookSnapshot, SimulatedOrder } from '@/types';
import { FillMetrics } from '@/utils/metrics';

interface OrderBookState {
  books: Record<string, Record<string, OrderBookSnapshot>>; // venue → symbol → book
  simulations: SimulatedOrder[];
  lastMetrics?: FillMetrics;
  setBook: (venue: string, symbol: string, data: OrderBookSnapshot) => void;
  addSimulation: (order: SimulatedOrder, metrics: FillMetrics) => void;
}

export const useOrderBookStore = create<OrderBookState>()(
  devtools((set) => ({
    books: {},
    simulations: [],
    lastMetrics: undefined,
    setBook: (venue, symbol, data) =>
      set((s) => ({
        books: {
          ...s.books,
          [venue]: { ...(s.books[venue] || {}), [symbol]: data },
        },
      })),
    addSimulation: (order, metrics) =>
      set((s) => ({ simulations: [...s.simulations, order], lastMetrics: metrics })),
  }))
);
