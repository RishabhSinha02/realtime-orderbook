'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderBookStore } from '@/store/useOrderBookStore';
import { v4 as uuid } from 'uuid';
import { OrderSide, OrderType } from '@/types';
import { Venue } from '@/app/page';
import { calcFill } from '@/utils/metrics';

const schema = z.object({
  type: z.enum(['market', 'limit']),
  side: z.enum(['buy', 'sell']),
  price: z.string().regex(/^[0-9]+(\.[0-9]+)?$/).optional(),
  qty: z.string().regex(/^[0-9]+(\.[0-9]+)?$/),
  delay: z.enum(['0', '5', '10', '30']),
});

type FormValues = z.infer<typeof schema>;

export default function SimulationForm({ venue, symbol }: { venue: Venue; symbol: string }) {
  // Avoid returning a *new object* from the selector every render – this was
  // triggering React 18’s “getServerSnapshot should be cached” warning and an
  // update‑depth loop. Use **separate** selectors instead.
  const books = useOrderBookStore((s) => s.books);
  const addSimulation = useOrderBookStore((s) => s.addSimulation);

const { register, handleSubmit, watch, reset, trigger, formState } =
  useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',        // ✅ validate on each change
    defaultValues: { type: 'limit', side: 'buy', delay: '0' } as any,
  });

  const onSubmit = (data: FormValues) => {
    const book = books[venue]?.[symbol];
    if (!book) {
      alert('Orderbook not ready – please wait a moment.');
      return;
    }

    const topOpposite = data.side === 'buy' ? book.asks[0].price : book.bids[0].price;

    const order = {
      id: uuid(),
      venue,
      symbol,
      side: data.side as OrderSide,
      type: data.type as OrderType,
      price: parseFloat(data.price ?? topOpposite.toString()),
      qty: parseFloat(data.qty),
      createdAt: Date.now(),
    } as const;

    const metrics = calcFill(order, book);

    const push = () => addSimulation(order, metrics);
    if (data.delay !== '0') setTimeout(push, +data.delay * 1000);
    else push();
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

//       <input {...register('qty')} placeholder="Quantity" className="w-full rounded bg-gray-800 p-2" />

//       <select {...register('side')} className="w-full rounded bg-gray-800 p-2">
//         <option value="buy">Buy</option>
//         <option value="sell">Sell</option>
//       </select>

//       <select {...register('delay')} className="w-full rounded bg-gray-800 p-2">
//         <option value="0">Immediate</option>
//         <option value="5">5 s delay</option>
//         <option value="10">10 s delay</option>
//         <option value="30">30 s delay</option>
//       </select>

//       <button
//         type="submit"
//         className="w-full rounded bg-blue-600 p-2 disabled:opacity-50"
//         disabled={!formState.isValid}
//       >
//         Simulate Order
//       </button>
//     </form>
//   );
// }