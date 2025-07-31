export interface BookLevel {
  price: number;
  size: number;
}

export interface OrderBookSnapshot {
  bids: BookLevel[]; // length N
  asks: BookLevel[]; // length N
  ts: number; // epoch ms
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export interface SimulatedOrder {
  id: string;
  venue: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number; // limit only
  qty: number;
  createdAt: number;
}