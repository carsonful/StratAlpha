// Placeholder data — replace each export with real API calls once endpoints exist.
import type { BacktestRun, EquityPoint, MonthlyReturn, StrategyPerf, TradeLogEntry } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeDrawdown(points: { date: string; value: number }[]): EquityPoint[] {
  let peak = -Infinity
  return points.map((p) => {
    if (p.value > peak) peak = p.value
    return { ...p, drawdown: parseFloat((((p.value - peak) / peak) * 100).toFixed(2)) }
  })
}

// ── Equity curve (global default) ─────────────────────────────────────────────

export const equityCurveData: EquityPoint[] = computeDrawdown([
  { date: 'Jan 1',  value: 10000 },
  { date: 'Jan 8',  value: 10340 },
  { date: 'Jan 15', value: 10190 },
  { date: 'Jan 22', value: 10820 },
  { date: 'Feb 1',  value: 10650 },
  { date: 'Feb 8',  value: 11300 },
  { date: 'Feb 15', value: 11080 },
  { date: 'Feb 22', value: 11740 },
  { date: 'Mar 1',  value: 11520 },
  { date: 'Mar 8',  value: 12150 },
  { date: 'Mar 15', value: 12480 },
  { date: 'Mar 22', value: 12200 },
  { date: 'Apr 1',  value: 12890 },
])

// ── Monthly returns ───────────────────────────────────────────────────────────

export const monthlyReturnsData: MonthlyReturn[] = [
  { month: 'Jan', return: 8.2 },
  { month: 'Feb', return: -2.1 },
  { month: 'Mar', return: 12.4 },
  { month: 'Apr', return: 5.7 },
  { month: 'May', return: -3.8 },
  { month: 'Jun', return: 9.1 },
  { month: 'Jul', return: 4.3 },
]

// ── Per-run trade logs ────────────────────────────────────────────────────────

const bt001TradeLog: TradeLogEntry[] = [
  { tradeId: 'T-001', entryDate: 'Jan 3',  exitDate: 'Jan 8',  side: 'Long',  entryPrice: 42150, exitPrice: 43800, pnl:  391, pnlPct: '+3.9%'  },
  { tradeId: 'T-002', entryDate: 'Jan 11', exitDate: 'Jan 16', side: 'Long',  entryPrice: 43200, exitPrice: 42600, pnl: -140, pnlPct: '-1.4%'  },
  { tradeId: 'T-003', entryDate: 'Jan 19', exitDate: 'Jan 25', side: 'Long',  entryPrice: 42900, exitPrice: 44500, pnl:  373, pnlPct: '+3.7%'  },
  { tradeId: 'T-004', entryDate: 'Jan 28', exitDate: 'Feb 3',  side: 'Short', entryPrice: 45200, exitPrice: 44100, pnl:  244, pnlPct: '+2.4%'  },
  { tradeId: 'T-005', entryDate: 'Feb 6',  exitDate: 'Feb 12', side: 'Long',  entryPrice: 43800, exitPrice: 45600, pnl:  411, pnlPct: '+4.1%'  },
  { tradeId: 'T-006', entryDate: 'Feb 15', exitDate: 'Feb 20', side: 'Long',  entryPrice: 46100, exitPrice: 45400, pnl: -152, pnlPct: '-1.5%'  },
  { tradeId: 'T-007', entryDate: 'Feb 23', exitDate: 'Mar 1',  side: 'Long',  entryPrice: 45900, exitPrice: 47200, pnl:  283, pnlPct: '+2.8%'  },
  { tradeId: 'T-008', entryDate: 'Mar 5',  exitDate: 'Mar 11', side: 'Short', entryPrice: 48300, exitPrice: 46900, pnl:  290, pnlPct: '+2.9%'  },
  { tradeId: 'T-009', entryDate: 'Mar 14', exitDate: 'Mar 20', side: 'Long',  entryPrice: 46500, exitPrice: 47800, pnl:  280, pnlPct: '+2.8%'  },
  { tradeId: 'T-010', entryDate: 'Mar 23', exitDate: 'Mar 29', side: 'Long',  entryPrice: 47200, exitPrice: 46500, pnl: -148, pnlPct: '-1.5%'  },
]

const bt002TradeLog: TradeLogEntry[] = [
  { tradeId: 'T-001', entryDate: 'Jan 4',  exitDate: 'Jan 9',  side: 'Long',  entryPrice: 2210, exitPrice: 2290, pnl:  181, pnlPct: '+3.6%'  },
  { tradeId: 'T-002', entryDate: 'Jan 12', exitDate: 'Jan 18', side: 'Short', entryPrice: 2350, exitPrice: 2280, pnl:  149, pnlPct: '+3.0%'  },
  { tradeId: 'T-003', entryDate: 'Jan 21', exitDate: 'Jan 27', side: 'Long',  entryPrice: 2240, exitPrice: 2190, pnl: -112, pnlPct: '-2.2%'  },
  { tradeId: 'T-004', entryDate: 'Feb 2',  exitDate: 'Feb 8',  side: 'Long',  entryPrice: 2180, exitPrice: 2260, pnl:  184, pnlPct: '+3.7%'  },
  { tradeId: 'T-005', entryDate: 'Feb 11', exitDate: 'Feb 16', side: 'Short', entryPrice: 2310, exitPrice: 2390, pnl: -173, pnlPct: '-3.5%'  },
  { tradeId: 'T-006', entryDate: 'Feb 19', exitDate: 'Feb 25', side: 'Long',  entryPrice: 2320, exitPrice: 2400, pnl:  173, pnlPct: '+3.4%'  },
  { tradeId: 'T-007', entryDate: 'Mar 1',  exitDate: 'Mar 7',  side: 'Long',  entryPrice: 2380, exitPrice: 2460, pnl:  168, pnlPct: '+3.4%'  },
  { tradeId: 'T-008', entryDate: 'Mar 10', exitDate: 'Mar 15', side: 'Short', entryPrice: 2490, exitPrice: 2430, pnl:  121, pnlPct: '+2.4%'  },
  { tradeId: 'T-009', entryDate: 'Mar 18', exitDate: 'Mar 24', side: 'Long',  entryPrice: 2410, exitPrice: 2360, pnl: -104, pnlPct: '-2.1%'  },
  { tradeId: 'T-010', entryDate: 'Mar 27', exitDate: 'Mar 31', side: 'Long',  entryPrice: 2350, exitPrice: 2420, pnl:  149, pnlPct: '+3.0%'  },
]

const bt003TradeLog: TradeLogEntry[] = [
  { tradeId: 'T-001', entryDate: 'Feb 2',  exitDate: 'Feb 7',  side: 'Long',  entryPrice: 98,  exitPrice: 110, pnl:  122, pnlPct: '+12.2%' },
  { tradeId: 'T-002', entryDate: 'Feb 10', exitDate: 'Feb 15', side: 'Short', entryPrice: 115, exitPrice: 105, pnl:  87,  pnlPct: '+8.7%'  },
  { tradeId: 'T-003', entryDate: 'Feb 18', exitDate: 'Feb 23', side: 'Long',  entryPrice: 108, exitPrice: 98,  pnl: -93,  pnlPct: '-9.3%'  },
  { tradeId: 'T-004', entryDate: 'Feb 26', exitDate: 'Mar 3',  side: 'Long',  entryPrice: 95,  exitPrice: 85,  pnl: -105, pnlPct: '-10.5%' },
  { tradeId: 'T-005', entryDate: 'Mar 6',  exitDate: 'Mar 11', side: 'Short', entryPrice: 90,  exitPrice: 80,  pnl:  111, pnlPct: '+11.1%' },
  { tradeId: 'T-006', entryDate: 'Mar 14', exitDate: 'Mar 19', side: 'Long',  entryPrice: 78,  exitPrice: 88,  pnl:  128, pnlPct: '+12.8%' },
  { tradeId: 'T-007', entryDate: 'Mar 22', exitDate: 'Mar 27', side: 'Long',  entryPrice: 92,  exitPrice: 84,  pnl:  -87, pnlPct: '-8.7%'  },
  { tradeId: 'T-008', entryDate: 'Mar 30', exitDate: 'Apr 4',  side: 'Short', entryPrice: 87,  exitPrice: 95,  pnl:  -92, pnlPct: '-9.2%'  },
  { tradeId: 'T-009', entryDate: 'Apr 7',  exitDate: 'Apr 12', side: 'Long',  entryPrice: 90,  exitPrice: 98,  pnl:   89, pnlPct: '+8.9%'  },
  { tradeId: 'T-010', entryDate: 'Apr 15', exitDate: 'Apr 20', side: 'Short', entryPrice: 102, exitPrice: 96,  pnl:   59, pnlPct: '+5.9%'  },
]

const bt004TradeLog: TradeLogEntry[] = [
  { tradeId: 'T-001', entryDate: 'Mar 1',  exitDate: 'Mar 5',  side: 'Long',  entryPrice: 61200, exitPrice: 62800, pnl:  261, pnlPct: '+2.6%'  },
  { tradeId: 'T-002', entryDate: 'Mar 8',  exitDate: 'Mar 12', side: 'Long',  entryPrice: 63100, exitPrice: 62400, pnl: -111, pnlPct: '-1.1%'  },
  { tradeId: 'T-003', entryDate: 'Mar 15', exitDate: 'Mar 19', side: 'Short', entryPrice: 63800, exitPrice: 62900, pnl:  141, pnlPct: '+1.4%'  },
  { tradeId: 'T-004', entryDate: 'Mar 22', exitDate: 'Mar 26', side: 'Long',  entryPrice: 62500, exitPrice: 63900, pnl:  224, pnlPct: '+2.2%'  },
  { tradeId: 'T-005', entryDate: 'Mar 29', exitDate: 'Apr 2',  side: 'Long',  entryPrice: 64200, exitPrice: 65100, pnl:  140, pnlPct: '+1.4%'  },
  { tradeId: 'T-006', entryDate: 'Apr 5',  exitDate: 'Apr 9',  side: 'Long',  entryPrice: 64800, exitPrice: 64100, pnl: -108, pnlPct: '-1.1%'  },
  { tradeId: 'T-007', entryDate: 'Apr 12', exitDate: 'Apr 16', side: 'Short', entryPrice: 65400, exitPrice: 64600, pnl:  123, pnlPct: '+1.2%'  },
  { tradeId: 'T-008', entryDate: 'Apr 19', exitDate: 'Apr 23', side: 'Long',  entryPrice: 64200, exitPrice: 65300, pnl:  171, pnlPct: '+1.7%'  },
  { tradeId: 'T-009', entryDate: 'Apr 26', exitDate: 'Apr 30', side: 'Long',  entryPrice: 65600, exitPrice: 64900, pnl: -107, pnlPct: '-1.1%'  },
  { tradeId: 'T-010', entryDate: 'May 3',  exitDate: 'May 7',  side: 'Long',  entryPrice: 65100, exitPrice: 66200, pnl:  169, pnlPct: '+1.7%'  },
]

// ── Recent runs ───────────────────────────────────────────────────────────────

export const recentRuns: BacktestRun[] = [
  {
    id:             'BT-001',
    strategy:       'SMA Crossover',
    symbol:         'BTC/USD',
    period:         'Jan–Mar 2024',
    startDate:      '2024-01-01',
    endDate:        '2024-03-31',
    initialCapital: 10000,
    commission:     0.1,
    totalReturn:    '+28.9%',
    sharpe:         1.84,
    maxDrawdown:    '-8.2%',
    winRate:        '61%',
    trades:         18,
    avgDuration:    '4.1 days',
    status:         'complete',
    equityCurve: computeDrawdown([
      { date: 'Jan 1',  value: 10000 },
      { date: 'Jan 8',  value: 10420 },
      { date: 'Jan 15', value: 10280 },
      { date: 'Jan 22', value: 10890 },
      { date: 'Feb 1',  value: 10730 },
      { date: 'Feb 8',  value: 11440 },
      { date: 'Feb 15', value: 11190 },
      { date: 'Feb 22', value: 11980 },
      { date: 'Mar 1',  value: 11720 },
      { date: 'Mar 15', value: 12550 },
      { date: 'Mar 31', value: 12890 },
    ]),
    tradeLog: bt001TradeLog,
  },
  {
    id:             'BT-002',
    strategy:       'RSI Mean Reversion',
    symbol:         'ETH/USD',
    period:         'Jan–Mar 2024',
    startDate:      '2024-01-01',
    endDate:        '2024-03-31',
    initialCapital: 10000,
    commission:     0.1,
    totalReturn:    '+12.4%',
    sharpe:         1.21,
    maxDrawdown:    '-15.6%',
    winRate:        '54%',
    trades:         22,
    avgDuration:    '3.2 days',
    status:         'complete',
    equityCurve: computeDrawdown([
      { date: 'Jan 1',  value: 10000 },
      { date: 'Jan 8',  value: 10180 },
      { date: 'Jan 15', value: 9850  },
      { date: 'Jan 22', value: 10310 },
      { date: 'Feb 1',  value: 8440  },
      { date: 'Feb 8',  value: 9200  },
      { date: 'Feb 15', value: 9780  },
      { date: 'Feb 22', value: 10540 },
      { date: 'Mar 1',  value: 10290 },
      { date: 'Mar 15', value: 11050 },
      { date: 'Mar 31', value: 11240 },
    ]),
    tradeLog: bt002TradeLog,
  },
  {
    id:             'BT-003',
    strategy:       'Bollinger Breakout',
    symbol:         'SOL/USD',
    period:         'Feb–Mar 2024',
    startDate:      '2024-02-01',
    endDate:        '2024-03-31',
    initialCapital: 10000,
    commission:     0.15,
    totalReturn:    '-4.1%',
    sharpe:         0.47,
    maxDrawdown:    '-22.3%',
    winRate:        '43%',
    trades:         14,
    avgDuration:    '5.8 days',
    status:         'complete',
    equityCurve: computeDrawdown([
      { date: 'Feb 1',  value: 10000 },
      { date: 'Feb 8',  value: 10580 },
      { date: 'Feb 15', value: 10200 },
      { date: 'Feb 22', value: 9650  },
      { date: 'Mar 1',  value: 7770  },
      { date: 'Mar 8',  value: 8500  },
      { date: 'Mar 15', value: 8920  },
      { date: 'Mar 22', value: 8600  },
      { date: 'Mar 31', value: 9590  },
    ]),
    tradeLog: bt003TradeLog,
  },
  {
    id:             'BT-004',
    strategy:       'MACD Trend Follow',
    symbol:         'BTC/USD',
    period:         'Mar 2024',
    startDate:      '2024-03-01',
    endDate:        '2024-03-31',
    initialCapital: 10000,
    commission:     0.1,
    totalReturn:    '+7.6%',
    sharpe:         1.05,
    maxDrawdown:    '-5.9%',
    winRate:        '58%',
    trades:         10,
    avgDuration:    '3.8 days',
    status:         'running',
    equityCurve: computeDrawdown([
      { date: 'Mar 1',  value: 10000 },
      { date: 'Mar 5',  value: 10260 },
      { date: 'Mar 10', value: 10150 },
      { date: 'Mar 15', value: 10390 },
      { date: 'Mar 20', value: 10530 },
      { date: 'Mar 25', value: 10470 },
      { date: 'Mar 31', value: 10760 },
    ]),
    tradeLog: bt004TradeLog,
  },
]

// ── Strategy performance comparison ──────────────────────────────────────────

export const strategyPerfData: StrategyPerf[] = [
  { strategy: 'SMA Crossover',      symbol: 'BTC/USD', totalReturn: '+28.9%', returnNum:  28.9, sharpe: 1.84, maxDrawdown: '-8.2%',  winRate: '61%' },
  { strategy: 'RSI Mean Reversion', symbol: 'ETH/USD', totalReturn: '+12.4%', returnNum:  12.4, sharpe: 1.21, maxDrawdown: '-15.6%', winRate: '54%' },
  { strategy: 'Bollinger Breakout', symbol: 'SOL/USD', totalReturn: '-4.1%',  returnNum:  -4.1, sharpe: 0.47, maxDrawdown: '-22.3%', winRate: '43%' },
  { strategy: 'MACD Trend Follow',  symbol: 'BTC/USD', totalReturn: '+7.6%',  returnNum:   7.6, sharpe: 1.05, maxDrawdown: '-5.9%',  winRate: '58%' },
]
