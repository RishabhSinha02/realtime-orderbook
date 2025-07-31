'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderBookStore } from '../store/useOrderBookStore';
import { v4 as uuid } from 'uuid';
import { OrderSide, OrderType } from '../types';
import { Venue } from '../app/page';
import { calcFill } from '../utils/metrics';

/* ---------- Zod schema (discriminated union) ---------- */
const toNum = (v: unknown) => parseFloat(String(v));
const qty = z.preprocess(toNum, z.number().positive('Qty must be > 0'));
const price = z.preprocess(toNum, z.number().positive('Price must be > 0'));

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('market'),
    side: z.enum(['buy', 'sell']),
    qty: z.preprocess(toNum, z.number().positive('Qty must be > 0')),
    delay: z.enum(['0', '5', '10', '30']),
    price: z.undefined(),
  }),
  z.object({
    type: z.literal('limit'),
    side: z.enum(['buy', 'sell']),
    qty: z.preprocess(toNum, z.number().positive('Qty must be > 0')),
    delay: z.enum(['0', '5', '10', '30']),
    price: z.preprocess(toNum, z.number().positive('Price must be > 0')),
  }),
]);

type FormValues =
  | {
      type: 'market';
      side: 'buy' | 'sell';
      qty: unknown;
      delay: '0' | '5' | '10' | '30';
      price?: undefined;
    }
  | {
      type: 'limit';
      side: 'buy' | 'sell';
      qty: unknown;
      delay: '0' | '5' | '10' | '30';
      price: unknown;
    };

export default function SimulationForm({ venue, symbol }: { venue: Venue; symbol: string }) {
  const books = useOrderBookStore((s) => s.books);
  const addSimulation = useOrderBookStore((s) => s.addSimulation);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { type: 'market', side: 'buy', delay: '0', qty: 0 } as any,
  });

  const type = watch('type');

  const onSubmit = (data: FormValues) => {
    const book = books[venue]?.[symbol];
    if (!book) return alert('Orderbook not ready yet.');

    // Cast qty and price to number after Zod validation
    const qty = Number((data as any).qty);
    const price = data.type === 'limit' ? Number((data as any).price) : undefined;

    const marketPrice =
      data.side === 'buy' ? book.asks[0]?.price : book.bids[0]?.price;

    const priceToUse = data.type === 'market' ? marketPrice : price;
    if (!priceToUse) return alert('Price unavailable.');

    const order = {
      id: uuid(),
      venue,
      symbol,
      side: data.side as OrderSide,
      type: data.type as OrderType,
      price: priceToUse,
      qty: qty,
      createdAt: Date.now(),
    } as const;

    addSimulation(order, calcFill(order, book));

    // reset: keep same type/side/delay but clear qty & price
    reset({ ...data, price: undefined, qty: 0 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Order type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Order Type</label>
        <select {...register('type')} className="w-full rounded-lg bg-gray-800/60 p-3 text-base focus:ring-2 focus:ring-blue-500 transition border border-gray-700/50">
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
        </select>
      </div>

      {/* Price field only for limit */}
      {type === 'limit' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Limit Price</label>
          <input
            {...register('price')}
            placeholder="Enter limit price"
            className="w-full rounded-lg bg-gray-800/60 p-3 text-base focus:ring-2 focus:ring-blue-500 transition border border-gray-700/50"
          />
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Quantity</label>
        <input 
          {...register('qty')} 
          placeholder="Enter quantity" 
          className="w-full rounded-lg bg-gray-800/60 p-3 text-base focus:ring-2 focus:ring-blue-500 transition border border-gray-700/50" 
        />
      </div>

      {/* Side */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Side</label>
        <select {...register('side')} className="w-full rounded-lg bg-gray-800/60 p-3 text-base focus:ring-2 focus:ring-blue-500 transition border border-gray-700/50">
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      {/* Delay */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Timing</label>
        <select {...register('delay')} className="w-full rounded-lg bg-gray-800/60 p-3 text-base focus:ring-2 focus:ring-blue-500 transition border border-gray-700/50">
          <option value="0">Immediate</option>
          <option value="5">5 seconds delay</option>
          <option value="10">10 seconds delay</option>
          <option value="30">30 seconds delay</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 p-4 font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={!isValid}
      >
        Simulate Order
      </button>
    </form>
  );
}