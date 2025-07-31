# Real-Time Orderbook Viewer with Order Simulation

A modern, real-time orderbook viewer application that displays live market data from multiple cryptocurrency exchanges with advanced order simulation capabilities.

## 🚀 Features

### Core Functionality
- **Multi-Venue Support**: Real-time orderbook data from OKX, Bybit, and Deribit
- **Live Updates**: WebSocket-based real-time data streaming
- **Order Simulation**: Test trading strategies with market/limit orders
- **Impact Analysis**: Calculate fill percentage, market impact, and slippage
- **Visual Indicators**: Highlight simulated orders in the orderbook
- **Market Depth Chart**: Interactive depth visualization

### Technical Features
- **Responsive Design**: Modern glassmorphism UI with dark theme
- **Real-time Connection Status**: Live indicators for WebSocket connections
- **Dynamic Symbol Selection**: Venue-specific symbol dropdowns
- **Error Handling**: Graceful handling of connection failures
- **State Management**: Centralized state with Zustand

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.4.4**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### State Management & Forms
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Real-time Communication
- **react-use-websocket**: WebSocket hook for real-time data
- **WebSocket APIs**: Direct connections to exchange APIs

### Data Visualization
- **Chart.js**: Market depth visualization
- **react-chartjs-2**: React wrapper for Chart.js

### UI Components
- **react-icons/fa**: Font Awesome icons
- **Custom Components**: Tailored orderbook and simulation components

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd realtime-orderbook

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
No environment variables are required for basic functionality. The application connects directly to public WebSocket APIs.

### Exchange Configuration
The application supports three exchanges with their specific configurations:

| Exchange | WebSocket URL | Symbol Format | Depth Levels |
|----------|---------------|---------------|--------------|
| OKX | `wss://ws.okx.com:8443/ws/v5/public` | `BTC-USDT` | 15 |
| Bybit | `wss://stream.bybit.com/v5/public/linear` | `BTCUSDT` | 50 |
| Deribit | `wss://www.deribit.com/ws/api/v2` | `BTC-PERPETUAL` | 20 |

## 📊 API Documentation

### WebSocket Connections

#### OKX API
```typescript
// Connection
const url = 'wss://ws.okx.com:8443/ws/v5/public';

// Subscription Message
{
  "op": "subscribe",
  "args": [{ "channel": "books", "instId": "BTC-USDT" }]
}

// Response Format
{
  "action": "snapshot" | "update",
  "data": [{
    "instId": "BTC-USDT",
    "bids": [["price", "size"]],
    "asks": [["price", "size"]],
    "ts": "timestamp"
  }]
}
```

#### Bybit API
```typescript
// Connection
const url = 'wss://stream.bybit.com/v5/public/linear';

// Subscription Message
{
  "op": "subscribe",
  "args": ["orderbook.50.BTCUSDT"]
}

// Response Format
{
  "type": "snapshot" | "delta",
  "data": {
    "s": "BTCUSDT",
    "b": [["price", "size"]],
    "a": [["price", "size"]],
    "ts": "timestamp"
  }
}
```

#### Deribit API
```typescript
// Connection
const url = 'wss://www.deribit.com/ws/api/v2';

// Subscription Message
{
  "jsonrpc": "2.0",
  "id": 42,
  "method": "public/subscribe",
  "params": {
    "channels": ["book.BTC-PERPETUAL.none.20.100ms"]
  }
}

// Response Format
{
  "params": {
    "data": {
      "bids": [["price", "size"]],
      "asks": [["price", "size"]],
      "timestamp": "timestamp"
    }
  }
}
```

### Rate Limiting Considerations

#### Exchange Rate Limits
- **OKX**: No documented rate limits for public orderbook data
- **Bybit**: No documented rate limits for public orderbook data  
- **Deribit**: No documented rate limits for public orderbook data

#### Application-Level Rate Limiting
- **Reconnection Strategy**: 3-second intervals with exponential backoff
- **Message Processing**: Throttled to prevent UI blocking
- **Symbol Filtering**: Only processes relevant symbol data

#### Best Practices
- Monitor connection status and implement circuit breakers
- Implement exponential backoff for reconnections
- Filter messages by symbol to reduce processing overhead
- Use WebSocket ping/pong for connection health checks

## 🏗️ Architecture

### Component Structure
```
app/
├── page.tsx                 # Main dashboard layout
├── layout.tsx              # Root layout
└── globals.css             # Global styles

components/
├── OrderBookTable.tsx      # Real-time orderbook display
├── SimulationForm.tsx      # Order simulation form
├── DepthChart.tsx          # Market depth visualization
└── ImpactMetrics.tsx       # Order impact calculations

hooks/
└── useOrderBookSocket.ts   # WebSocket connection management

store/
└── useOrderBookStore.ts    # Zustand state management

utils/
└── metrics.ts              # Impact calculation utilities
```

### State Management
The application uses Zustand for centralized state management:

```typescript
interface OrderBookStore {
  books: Record<Venue, Record<string, OrderBook>>;
  simulations: Simulation[];
  setBook: (venue: Venue, symbol: string, book: OrderBook) => void;
  addSimulation: (sim: Simulation) => void;
  clearSimulations: () => void;
}
```

### Data Flow
1. **WebSocket Connection**: `useOrderBookSocket` establishes connection
2. **Data Processing**: Raw messages parsed and merged into orderbook
3. **State Update**: Zustand store updated with processed data
4. **UI Rendering**: Components react to state changes
5. **Simulation**: User inputs trigger impact calculations

## 🎯 Order Simulation

### Supported Order Types
- **Market Orders**: Immediate execution at best available price
- **Limit Orders**: Execution at specified price or better

### Impact Metrics Calculated
- **Fill Quantity**: Amount of order that would be filled
- **Fill Percentage**: Percentage of order filled
- **Average Fill Price**: Weighted average execution price
- **Slippage**: Difference between expected and actual price
- **Market Impact**: Estimated price movement caused by order
- **Time to Fill**: Estimated time for order completion

### Calculation Logic
```typescript
// Fill calculation for limit orders
const fillQty = Math.min(orderQty, availableLiquidity);
const fillPct = (fillQty / orderQty) * 100;
const avgPrice = weightedAverage(executionPrices);
const slippage = ((avgPrice - expectedPrice) / expectedPrice) * 100;
```

## 🔒 Security Considerations

### Public APIs Only
- All WebSocket connections use public endpoints
- No authentication required for orderbook data
- No sensitive data transmitted

### Data Validation
- Input validation using Zod schemas
- Symbol format validation per exchange
- Price and quantity range validation

### Error Handling
- Graceful degradation on connection failures
- User-friendly error messages
- Automatic reconnection with backoff

## 📝 Assumptions Made

### Technical Assumptions
1. **WebSocket Reliability**: Assumes stable internet connection
2. **Exchange Availability**: Assumes exchange APIs are operational
3. **Data Format**: Assumes consistent message formats from exchanges
4. **Browser Support**: Assumes modern browser with WebSocket support
