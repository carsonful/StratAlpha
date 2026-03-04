// Placeholder data — replace with real API calls once the backend endpoints exist
import type { BacktestRun, EquityPoint, MonthlyReturn, OHLCVCandle, StrategyDetail, StrategyPerf, TradeLogEntry } from '../types'

// Calculates how far below the peak the portfolio is at each point (the drawdown)
function computeDrawdown(points: { date: string; value: number }[]): EquityPoint[] {
  let peak = -Infinity
  return points.map((p) => {
    if (p.value > peak) peak = p.value
    return { ...p, drawdown: parseFloat((((p.value - peak) / peak) * 100).toFixed(2)) }
  })
}

// Default equity curve shown on the dashboard
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

// Monthly return percentages for the bar chart
export const monthlyReturnsData: MonthlyReturn[] = [
  { month: 'Jan', return: 8.2 },
  { month: 'Feb', return: -2.1 },
  { month: 'Mar', return: 12.4 },
  { month: 'Apr', return: 5.7 },
  { month: 'May', return: -3.8 },
  { month: 'Jun', return: 9.1 },
  { month: 'Jul', return: 4.3 },
]

// Trade logs for each backtest run
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

// All backtest runs shown in the dashboard table
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

// Strategy summary data for the comparison table
export const strategyPerfData: StrategyPerf[] = [
  { strategy: 'SMA Crossover',      symbol: 'BTC/USD', totalReturn: '+28.9%', returnNum:  28.9, sharpe: 1.84, maxDrawdown: '-8.2%',  winRate: '61%' },
  { strategy: 'RSI Mean Reversion', symbol: 'ETH/USD', totalReturn: '+12.4%', returnNum:  12.4, sharpe: 1.21, maxDrawdown: '-15.6%', winRate: '54%' },
  { strategy: 'Bollinger Breakout', symbol: 'SOL/USD', totalReturn: '-4.1%',  returnNum:  -4.1, sharpe: 0.47, maxDrawdown: '-22.3%', winRate: '43%' },
  { strategy: 'MACD Trend Follow',  symbol: 'BTC/USD', totalReturn: '+7.6%',  returnNum:   7.6, sharpe: 1.05, maxDrawdown: '-5.9%',  winRate: '58%' },
]

// ── OHLCV candlestick data per symbol (Data page) ─────────────────────────────

export const ohlcvData: Record<string, OHLCVCandle[]> = {
  'BTC/USD': [
    { date: '2024-01-01', open: 42100, high: 43200, low: 41800, close: 42950, volume: 1.24 },
    { date: '2024-01-02', open: 42950, high: 44100, low: 42700, close: 43800, volume: 1.87 },
    { date: '2024-01-03', open: 43800, high: 44500, low: 43100, close: 43420, volume: 0.93 },
    { date: '2024-01-04', open: 43420, high: 43900, low: 42500, close: 42780, volume: 1.41 },
    { date: '2024-01-05', open: 42780, high: 43600, low: 42200, close: 43300, volume: 1.05 },
    { date: '2024-01-08', open: 43300, high: 45200, low: 43100, close: 44900, volume: 2.18 },
    { date: '2024-01-09', open: 44900, high: 45800, low: 44400, close: 45100, volume: 1.76 },
    { date: '2024-01-10', open: 45100, high: 46200, low: 44800, close: 46050, volume: 2.03 },
    { date: '2024-01-11', open: 46050, high: 46500, low: 45200, close: 45600, volume: 1.32 },
    { date: '2024-01-12', open: 45600, high: 46800, low: 45300, close: 46400, volume: 1.61 },
    { date: '2024-01-15', open: 46400, high: 47200, low: 45900, close: 47100, volume: 1.95 },
    { date: '2024-01-16', open: 47100, high: 47800, low: 46500, close: 46800, volume: 1.44 },
    { date: '2024-01-17', open: 46800, high: 47500, low: 46100, close: 47300, volume: 1.28 },
    { date: '2024-01-18', open: 47300, high: 48100, low: 46900, close: 47900, volume: 1.82 },
    { date: '2024-01-19', open: 47900, high: 48600, low: 47400, close: 48200, volume: 2.11 },
  ],
  'ETH/USD': [
    { date: '2024-01-01', open: 2190, high: 2260, low: 2150, close: 2230, volume: 14.2 },
    { date: '2024-01-02', open: 2230, high: 2310, low: 2200, close: 2290, volume: 18.7 },
    { date: '2024-01-03', open: 2290, high: 2340, low: 2250, close: 2270, volume: 11.3 },
    { date: '2024-01-04', open: 2270, high: 2290, low: 2190, close: 2210, volume: 15.6 },
    { date: '2024-01-05', open: 2210, high: 2260, low: 2180, close: 2240, volume: 12.9 },
    { date: '2024-01-08', open: 2240, high: 2380, low: 2230, close: 2360, volume: 21.4 },
    { date: '2024-01-09', open: 2360, high: 2420, low: 2330, close: 2400, volume: 19.8 },
    { date: '2024-01-10', open: 2400, high: 2460, low: 2380, close: 2440, volume: 17.2 },
    { date: '2024-01-11', open: 2440, high: 2470, low: 2390, close: 2410, volume: 14.5 },
    { date: '2024-01-12', open: 2410, high: 2500, low: 2400, close: 2480, volume: 20.1 },
    { date: '2024-01-15', open: 2480, high: 2530, low: 2450, close: 2510, volume: 16.3 },
    { date: '2024-01-16', open: 2510, high: 2550, low: 2470, close: 2490, volume: 13.8 },
    { date: '2024-01-17', open: 2490, high: 2540, low: 2460, close: 2520, volume: 15.1 },
    { date: '2024-01-18', open: 2520, high: 2580, low: 2500, close: 2560, volume: 18.4 },
    { date: '2024-01-19', open: 2560, high: 2620, low: 2540, close: 2600, volume: 22.7 },
  ],
  'SOL/USD': [
    { date: '2024-01-01', open: 96,  high: 102, low: 94,  close: 99,  volume: 420 },
    { date: '2024-01-02', open: 99,  high: 108, low: 97,  close: 105, volume: 580 },
    { date: '2024-01-03', open: 105, high: 110, low: 102, close: 104, volume: 390 },
    { date: '2024-01-04', open: 104, high: 107, low: 98,  close: 100, volume: 460 },
    { date: '2024-01-05', open: 100, high: 105, low: 97,  close: 103, volume: 410 },
    { date: '2024-01-08', open: 103, high: 112, low: 101, close: 110, volume: 640 },
    { date: '2024-01-09', open: 110, high: 116, low: 108, close: 114, volume: 710 },
    { date: '2024-01-10', open: 114, high: 118, low: 111, close: 116, volume: 530 },
    { date: '2024-01-11', open: 116, high: 119, low: 112, close: 113, volume: 480 },
    { date: '2024-01-12', open: 113, high: 120, low: 111, close: 118, volume: 590 },
    { date: '2024-01-15', open: 118, high: 124, low: 116, close: 122, volume: 670 },
    { date: '2024-01-16', open: 122, high: 126, low: 119, close: 121, volume: 510 },
    { date: '2024-01-17', open: 121, high: 125, low: 118, close: 123, volume: 490 },
    { date: '2024-01-18', open: 123, high: 129, low: 121, close: 127, volume: 620 },
    { date: '2024-01-19', open: 127, high: 132, low: 125, close: 130, volume: 750 },
  ],
}

// ── Strategy detail data with run counts and equity curves (Strategies page) ──

export const strategyDetailData: StrategyDetail[] = [
  {
    ...strategyPerfData[0], // SMA Crossover
    runs: 2,
    equityCurve: computeDrawdown([
      { date: 'Nov', value: 10000 },
      { date: 'Dec', value: 10600 },
      { date: 'Jan', value: 10420 },
      { date: 'Feb', value: 11440 },
      { date: 'Mar', value: 11720 },
      { date: 'Apr', value: 12890 },
    ]),
  },
  {
    ...strategyPerfData[1], // RSI Mean Reversion
    runs: 1,
    equityCurve: computeDrawdown([
      { date: 'Nov', value: 10000 },
      { date: 'Dec', value: 10180 },
      { date: 'Jan', value: 8440  },
      { date: 'Feb', value: 9780  },
      { date: 'Mar', value: 10290 },
      { date: 'Apr', value: 11240 },
    ]),
  },
  {
    ...strategyPerfData[2], // Bollinger Breakout
    runs: 1,
    equityCurve: computeDrawdown([
      { date: 'Nov', value: 10000 },
      { date: 'Dec', value: 10580 },
      { date: 'Jan', value: 9650  },
      { date: 'Feb', value: 7770  },
      { date: 'Mar', value: 8920  },
      { date: 'Apr', value: 9590  },
    ]),
  },
  {
    ...strategyPerfData[3], // MACD Trend Follow
    runs: 1,
    equityCurve: computeDrawdown([
      { date: 'Nov', value: 10000 },
      { date: 'Dec', value: 10260 },
      { date: 'Jan', value: 10150 },
      { date: 'Feb', value: 10390 },
      { date: 'Mar', value: 10530 },
      { date: 'Apr', value: 10760 },
    ]),
  },
]
