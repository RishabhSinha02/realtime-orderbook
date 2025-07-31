export interface BookLevel {
  price: number;
  size: number;
}

export interface OrderBookSnapshot {
  bids: BookLevel[]; 
  asks: BookLevel[]; 
  ts: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export interface SimulatedOrder {
  id: string;
  venue: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  qty: number;
  createdAt: number;
}