import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OrderBookSnapshot, SimulatedOrder, Venue } from '@/types';

interface OrderBookState {
  books: Record<string, Record<string, OrderBookSnapshot>>; // venue → symbol → book
  simulations: SimulatedOrder[];
  setBook: (venue: string, symbol: string, data: OrderBookSnapshot) => void;
  addSimulation: (order: SimulatedOrder) => void;
}

export const useOrderBookStore = create<OrderBookState>()(
  devtools((set) => ({
    books: {},
    simulations: [],
    setBook: (venue, symbol, data) =>
      set((s) => ({
        books: {
          ...s.books,
          [venue]: { ...(s.books[venue] || {}), [symbol]: data },
        },
      })),
    addSimulation: (order) => set((s) => ({ simulations: [...s.simulations, order] })),
  }))
);