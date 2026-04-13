import { useLocation, useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { BacktestRun } from '../types'

function parseReturnNum(s: string): number {
  const cleaned = s.replace('%', '').replace(',', '').trim()
  return parseFloat(cleaned) || 0
}

function fmtDollar(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function Backtests() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as BacktestRun | undefined

  if (!result) {
    return (
      <div style={{ padding: '16px' }}>
        <section className="page-heading">
          <div>
            <h1>Backtests</h1>
            <p>No backtest results to display</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/block')}>
            Build a Strategy
          </button>
        </section>
      </div>
    )
  }

  if (result.status === 'failed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <section className="page-heading">
          <div>
            <h1>Backtest Failed</h1>
            <p>
              {result.symbol} &middot; {result.startDate} to {result.endDate}
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/block')}>
            Back to Builder
          </button>
        </section>

        <div
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h3 style={{ color: '#f87171', margin: '0 0 8px', fontSize: '15px', fontWeight: 700 }}>
            Error
          </h3>
          <pre
            style={{
              color: '#f87171',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {result.errorMessage || 'Unknown error'}
          </pre>
        </div>
      </div>
    )
  }

  const returnNum = parseReturnNum(result.totalReturn)
  const returnPositive = returnNum >= 0
  const sharpePositive = result.sharpe >= 0

  const heroStats = [
    {
      label: 'Total Return',
      value: result.totalReturn,
      bg: returnPositive ? '#dcfce7' : '#fee2e2',
      color: returnPositive ? '#16a34a' : '#dc2626',
    },
    {
      label: 'Sharpe Ratio',
      value: result.sharpe.toFixed(2),
      bg: sharpePositive ? '#dbeafe' : '#fee2e2',
      color: sharpePositive ? '#2563eb' : '#dc2626',
    },
    {
      label: 'Max Drawdown',
      value: result.maxDrawdown,
      bg: '#fef3c7',
      color: '#92400e',
    },
    {
      label: 'Win Rate',
      value: result.winRate,
      bg: '#f3e8ff',
      color: '#7c3aed',
    },
  ]

  const secondaryStats = [
    { label: 'Total Trades', value: String(result.trades) },
    { label: 'Annual Return', value: result.annualReturn },
    { label: 'Sortino', value: result.sortino.toFixed(2) },
    { label: 'Alpha', value: result.alpha.toFixed(3) },
    { label: 'Beta', value: result.beta.toFixed(3) },
    { label: 'Commission', value: `$${result.commission.toFixed(2)}` },
  ]

  const equityData = result.equityCurve
  const tickInterval = Math.max(1, Math.floor(equityData.length / 8))

  const hasOpenPosition = result.trades > 0 && result.tradeLog.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section className="page-heading">
        <div>
          <h1>Backtest Results</h1>
          <p>
            {result.symbol} &middot; {result.period} &middot; {result.startDate} to{' '}
            {result.endDate}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/block')}>
          Back to Builder
        </button>
      </section>

      {/* Hero stat cards */}
      <div className="cards-grid">
        {heroStats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ background: s.bg }}
          >
            <span className="stat-card__title" style={{ color: s.color, opacity: 0.7 }}>
              {s.label}
            </span>
            <span className="stat-card__value" style={{ color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {secondaryStats.map((s) => (
          <div key={s.label} className="stat-card" style={{ background: '#fff', padding: '14px 16px' }}>
            <span className="stat-card__title">{s.label}</span>
            <span className="stat-card__value" style={{ fontSize: '18px' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Equity / Drawdown row */}
      <div style={{ display: 'grid', gridTemplateColumns: equityData.length > 0 ? '2fr 1fr' : '1fr', gap: '16px' }}>

        {/* Equity curve */}
        {equityData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h2>Equity Curve</h2>
                <span className="chart-sub">
                  {fmtDollar(result.startEquity)} &rarr; {fmtDollar(result.endEquity)}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={returnPositive ? '#16a34a' : '#dc2626'} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={returnPositive ? '#16a34a' : '#dc2626'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={tickInterval}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [fmtDollar(Number(value)), 'Equity']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={returnPositive ? '#16a34a' : '#dc2626'}
                  strokeWidth={2}
                  fill="url(#eqGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Drawdown chart */}
        {equityData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h2>Drawdown</h2>
                <span className="chart-sub">Peak-to-trough decline</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={false} height={10} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                  domain={['dataMin', 0]}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Drawdown']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <ReferenceLine y={0} stroke="#e5e7eb" />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  fill="url(#ddGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Trade log table */}
      {result.tradeLog.length > 0 && (
        <div className="table-card">
          <div className="table-header">
            <h2>Trade Log</h2>
          </div>
          <div className="table-scroll">
            <table className="runs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Side</th>
                  <th>Entry Date</th>
                  <th>Exit Date</th>
                  <th>Entry Price</th>
                  <th>Exit Price</th>
                  <th>P&L</th>
                  <th>P&L %</th>
                </tr>
              </thead>
              <tbody>
                {result.tradeLog.map((t) => (
                  <tr key={t.tradeId} className="runs-table__row">
                    <td className="run-id">{t.tradeId}</td>
                    <td>
                      <span className={t.side === 'Long' ? 'return-pos' : 'return-neg'}>
                        {t.side}
                      </span>
                    </td>
                    <td className="text-muted">{t.entryDate}</td>
                    <td className="text-muted">{t.exitDate || '\u2014'}</td>
                    <td className="fw-600">${t.entryPrice.toFixed(2)}</td>
                    <td className="fw-600">{t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : '\u2014'}</td>
                    <td className={t.pnl >= 0 ? 'return-pos' : 'return-neg'}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                    </td>
                    <td className={t.pnl >= 0 ? 'return-pos' : 'return-neg'}>{t.pnlPct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open position notice */}
      {hasOpenPosition && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13px',
            color: '#92400e',
          }}
        >
          <strong>No closed trades.</strong> The strategy placed {result.trades} order(s) but
          never closed the position. The equity curve reflects unrealized P&L from the open
          holding. Add exit conditions (stop loss, take profit, exit after N bars) to your
          order blocks to generate round-trip trades.
        </div>
      )}
    </div>
  )
}
