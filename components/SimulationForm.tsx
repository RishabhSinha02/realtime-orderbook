'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { v4 as uuid } from 'uuid';
import { OrderSide, OrderType } from '@/types';
import { Venue } from '@/app/page';

const schema = z.object({
  type: z.enum(['market', 'limit']),
  side: z.enum(['buy', 'sell']),
  price: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  qty: z.string().regex(/^[0-9]+(\.[0-9]+)?$/),
  delay: z.enum(['0', '5', '10', '30']),
});

type FormValues = z.infer<typeof schema>;

export default function SimulationForm({ venue, symbol }: { venue: Venue; symbol: string }) {
  const addSimulation = useOrderBookStore((s) => s.addSimulation);
  const { register, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'limit', side: 'buy', delay: '0' } as any,
  });

  const onSubmit = (data: FormValues) => {
    const order = {
      id: uuid(),
      venue,
      symbol,
      side: data.side as OrderSide,
      type: data.type as OrderType,
      price: parseFloat(data.price || '0'),
      qty: parseFloat(data.qty),
      createdAt: Date.now(),
    };
    if (data.delay !== '0') {
      setTimeout(() => addSimulation(order), parseInt(data.delay) * 1000);
    } else {
      addSimulation(order);
    }
    reset();
  };

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <select {...register('type')} className="w-full rounded bg-gray-800 p-2">
        <option value="market">Market</option>
        <option value="limit">Limit</option>
      </select>

      {type === 'limit' && (
        <input {...register('price')} placeholder="Price" className="w-full rounded bg-gray-800 p-2" />
      )}

      <input {...register('qty')} placeholder="Quantity" className="w-full rounded bg-gray-800 p-2" />

      <select {...register('side')} className="w-full rounded bg-gray-800 p-2">
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>

      <select {...register('delay')} className="w-full rounded bg-gray-800 p-2">
        <option value="0">Immediate</option>
        <option value="5">5 s delay</option>
        <option value="10">10 s delay</option>
        <option value="30">30 s delay</option>
      </select>

      <button
        type="submit"
        className="w-full rounded bg-blue-600 p-2 disabled:opacity-50"
        disabled={!formState.isValid}
      >
        Simulate Order
      </button>
    </form>
  );
}