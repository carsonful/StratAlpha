// TypeScript type definitions — these describe the shape of data used throughout the app

// A single trade entry in a backtest's trade log
export interface TradeLogEntry {
  tradeId:    string
  entryDate:  string
  exitDate:   string
  side:       'Long' | 'Short' // Long = bet price goes up, Short = bet it goes down
  entryPrice: number
  exitPrice:  number
  pnl:        number   // profit/loss in dollars
  pnlPct:     string   // profit/loss as a percentage string (e.g. '+2.3%')
}

// A single data point on the equity (portfolio value) curve
export interface EquityPoint {
  date:      string
  value:     number
  drawdown?: number  // how far below the peak we are, as %; always <= 0
}

// A single month's return percentage for the bar chart
export interface MonthlyReturn {
  month:  string
  return: number
}

// A full backtest run with its config, results, chart data, and trade log
export interface BacktestRun {
  id:             string
  strategy:       string
  symbol:         string
  period:         string
  startDate:      string
  endDate:        string
  initialCapital: number
  commission:     number
  totalReturn:    string
  sharpe:         number
  sortino:        number
  maxDrawdown:    string
  winRate:        string
  trades:         number
  avgDuration:    string
  annualReturn:   string
  alpha:          number
  beta:           number
  startEquity:    number
  endEquity:      number
  status:         'complete' | 'running' | 'failed'
  errorMessage?:  string
  equityCurve:    EquityPoint[]
  tradeLog:       TradeLogEntry[]
}

// Summary stats for a strategy used in the comparison table
export interface StrategyPerf {
  strategy:    string
  symbol:      string
  totalReturn: string
  returnNum:   number  // raw number used to scale the bar widths visually
  sharpe:      number
  maxDrawdown: string
  winRate:     string
}

// A single OHLCV candlestick data point
export interface OHLCVCandle {
  date:   string
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

// Extended strategy data used on the Strategies page (adds run count and equity curve preview)
export interface StrategyDetail extends StrategyPerf {
  runs:        number
  equityCurve: EquityPoint[]
}

// Form data submitted when starting a new backtest
export interface NewBacktestConfig {
  symbol:         string
  startDate:      string
  endDate:        string
  strategy:       string
  initialCapital: number
  commission:     number
  // Slippage configuration for more realistic execution
  slippageModel?: 'none' | 'fixed' | 'volatility' | 'volume' | 'volatility_volume'
  slippagePct?: number // base slippage percent (applies for 'fixed' and as baseline for others)
  volatilityScale?: boolean
  volumeScale?: boolean
}

// Simple user profile saved after login/register
export interface User {
  id: string
  name: string
  email: string
}

// Valid sidebar page keys
export type NavKey =
  | 'dashboard'
  | 'backtests'
  | 'block'
  | 'strategies'
  | 'data'
  | 'analytics'
  | 'risk'
  | 'settings'
