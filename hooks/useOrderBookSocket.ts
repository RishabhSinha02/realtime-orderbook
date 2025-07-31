/* -----------------------------------------------
 * useOrderBookSocket.ts
 * --------------------------------------------- */
import { useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { useOrderBookStore } from '@/store/useOrderBookStore';

export type Venue = 'OKX' | 'Bybit' | 'Deribit';

type Level = [number, number]; // [price, size]

function mergeLevels(
  store: Map<number, number>,
  delta: Level[],
  side: 'bid' | 'ask'
) {
  for (const [price, size] of delta) {
    if (size === 0) {
      store.delete(price);
    } else {
      store.set(price, size);
    }
  }
  // Sort & slice after merge
  const sorted = [...store.entries()].sort((a, b) =>
    side === 'bid' ? b[0] - a[0] : a[0] - b[0]
  );
  return sorted as Level[];
}

export function useOrderBookSocket(
  venue: Venue,
  symbol: string,
  depth = 15
) {
  const setBook = useOrderBookStore((s) => s.setBook);

  /* ---------- 1. venue‑specific URLs & subscribe strings ---------- */
  const { url, subMsg } = (() => {
    switch (venue) {
      case 'OKX':
        return {
          url: 'wss://ws.okx.com:8443/ws/v5/public',
          subMsg: {
            op: 'subscribe',
            args: [{ channel: 'books', instId: symbol }],
          },
        };
      case 'Bybit': {
        const depthTag = 50;
        // Bybit uses symbols without hyphens (e.g., BTCUSDT instead of BTC-USDT)
        const bybitSymbol = symbol.replace('-', '').toUpperCase();
        return {
          url: 'wss://stream.bybit.com/v5/public/linear',
          subMsg: {
            op: 'subscribe',
            args: [`orderbook.${depthTag}.${bybitSymbol}`],
          },
        };
      }
      case 'Deribit': {
        const depthTag = 20;
        // Deribit uses PERPETUAL format (e.g., BTC-PERPETUAL)
        // The symbol dropdown already provides the correct format
        return {
          url: 'wss://www.deribit.com/ws/api/v2',
          subMsg: {
            jsonrpc: '2.0',
            id: 42,
            method: 'public/subscribe',
            params: {
              channels: [`book.${symbol}.none.${depthTag}.100ms`],
            },
          },
        };
      }
      default:
        throw new Error('Unknown venue');
    }
  })();

  /* ---------- 2. connect ---------- */
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(url, {
    onOpen: () => sendJsonMessage(subMsg),
    shouldReconnect: () => true,
  });

  /* ---------- 3. local maps to accumulate levels ---------- */
  const bidMap = useRef<Map<number, number>>(new Map());
  const askMap = useRef<Map<number, number>>(new Map());
  const initialised = useRef(false);

  /* ---------- 4. parse & merge incoming frames ---------- */
  useEffect(() => {
    if (!lastJsonMessage) return;

    let bids: Level[] = [];
    let asks: Level[] = [];
    let ts = Date.now();
    let isSnapshot = false;

    /* ----- OKX ----- */
    if (
      venue === 'OKX' &&
      typeof lastJsonMessage === 'object' &&
      'arg' in lastJsonMessage
    ) {
      // OKX sends { action: 'snapshot' | 'update' }
      const data = (lastJsonMessage as any).data?.[0];
      bids = (data?.bids ?? []).map((x: string[]) => [
        +x[0],
        +x[1],
      ]);
      asks = (data?.asks ?? []).map((x: string[]) => [
        +x[0],
        +x[1],
      ]);
      ts = +data?.ts || ts;
      isSnapshot =
        (lastJsonMessage as any).action === 'snapshot' ||
        (lastJsonMessage as any).action === 'partial';
    }

    /* ----- BYBIT ----- */
    else if (
      venue === 'Bybit' &&
      typeof lastJsonMessage === 'object' &&
      'data' in lastJsonMessage
    ) {
      const frame = lastJsonMessage as any;
      bids = (frame.data?.b ?? []).map((x: string[]) => [+x[0], +x[1]]);
      asks = (frame.data?.a ?? []).map((x: string[]) => [+x[0], +x[1]]);
      ts = frame.data?.ts || ts;
      isSnapshot = frame.type === 'snapshot';
    }

    /* ----- DERIBIT (always full book for chosen depth) ----- */
    else if (
      venue === 'Deribit' &&
      typeof lastJsonMessage === 'object' &&
      'params' in lastJsonMessage
    ) {
      const d = (lastJsonMessage as any).params?.data;
      bids = (d?.bids ?? []) as Level[];
      asks = (d?.asks ?? []) as Level[];
      ts = d?.timestamp || ts;
      isSnapshot = true; // treat every frame as fresh snapshot
    }

    // nothing useful → bail
    if (!bids.length && !asks.length) return;

    /* ---------- 5. merge into maps ---------- */
    if (isSnapshot || !initialised.current) {
      // clear and load fresh snapshot
      bidMap.current = new Map(bids);
      askMap.current = new Map(asks);
      initialised.current = true;
    } else {
      // delta: merge
      mergeLevels(bidMap.current, bids, 'bid');
      mergeLevels(askMap.current, asks, 'ask');
    }

    /* ---------- 6. build arrays & slice ---------- */
    const finalBids = mergeLevels(bidMap.current, [], 'bid').slice(
      0,
      depth
    );
    const finalAsks = mergeLevels(askMap.current, [], 'ask').slice(
      0,
      depth
    );

    /* ---------- 7. store in Zustand ---------- */
    setBook(venue, symbol, {
      bids: finalBids.map(([p, s]) => ({ price: p, size: s })),
      asks: finalAsks.map(([p, s]) => ({ price: p, size: s })),
      ts,
    });
  }, [lastJsonMessage, venue, symbol, depth, setBook]);
}
