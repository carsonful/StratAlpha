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
  maxDrawdown:    string
  winRate:        string
  trades:         number
  avgDuration:    string
  status:         'complete' | 'running' | 'failed'
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

// Form data submitted when starting a new backtest
export interface NewBacktestConfig {
  symbol:         string
  startDate:      string
  endDate:        string
  strategy:       string
  initialCapital: number
  commission:     number
}

// Valid sidebar page keys
export type NavKey =
  | 'dashboard'
  | 'backtests'
  | 'strategies'
  | 'data'
  | 'analytics'
  | 'risk'
  | 'settings'
