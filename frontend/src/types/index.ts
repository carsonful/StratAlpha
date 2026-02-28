export interface TradeLogEntry {
  tradeId:    string
  entryDate:  string
  exitDate:   string
  side:       'Long' | 'Short'
  entryPrice: number
  exitPrice:  number
  pnl:        number   // absolute $
  pnlPct:     string   // '+2.3%'
}

export interface EquityPoint {
  date:      string
  value:     number
  drawdown?: number  // (value - peak) / peak * 100, always <= 0
}

export interface MonthlyReturn {
  month:  string
  return: number
}

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

export interface StrategyPerf {
  strategy:    string
  symbol:      string
  totalReturn: string
  returnNum:   number  // numeric value for bar width calculation
  sharpe:      number
  maxDrawdown: string
  winRate:     string
}

export interface NewBacktestConfig {
  symbol:         string
  startDate:      string
  endDate:        string
  strategy:       string
  initialCapital: number
  commission:     number
}

export type NavKey =
  | 'dashboard'
  | 'backtests'
  | 'strategies'
  | 'data'
  | 'analytics'
  | 'risk'
  | 'settings'
