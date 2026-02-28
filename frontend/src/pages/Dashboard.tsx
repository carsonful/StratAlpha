import { useRef, useState } from 'react'
import {
  Activity,
  BarChart2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BarRectangleItem } from 'recharts'
import NewBacktestModal from '../components/NewBacktestModal'
import { equityCurveData, monthlyReturnsData, recentRuns, strategyPerfData } from '../data/mockData'
import type { BacktestRun, NewBacktestConfig } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

const BAR_COLOR_POS          = '#818cf8'
const BAR_COLOR_NEG          = '#fca5a5'
const BAR_COLOR_POS_SELECTED = '#4f46e5'
const BAR_COLOR_NEG_SELECTED = '#dc2626'

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  colorClass,
  icon,
  onClick,
}: {
  title:      string
  value:      string
  sub:        string
  colorClass: string
  icon:       React.ReactNode
  onClick?:   () => void
}) {
  return (
    <div
      className={`stat-card ${colorClass}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card__top">
        <span className="stat-card__title">{title}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__sub">{sub}</span>
    </div>
  )
}

function StatusDot({ status }: { status: BacktestRun['status'] }) {
  const colorClass =
    status === 'complete'
      ? 'status-dot--complete'
      : status === 'running'
        ? 'status-dot--running'
        : 'status-dot--failed'
  const label =
    status === 'complete' ? 'Complete' : status === 'running' ? 'Running' : 'Failed'
  return (
    <span className={`status-dot ${colorClass}`}>
      <span className="status-dot__circle" />
      <span>{label}</span>
    </span>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-metric">
      <span className="detail-metric__label">{label}</span>
      <span className="detail-metric__value">{value}</span>
    </div>
  )
}

function DetailPanel({ run, onClose }: { run: BacktestRun; onClose: () => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-panel__header">
          <h2>
            {run.id} · {run.strategy}
          </h2>
          <button className="detail-panel__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="detail-panel__body">
          {/* 6-metric grid */}
          <div className="detail-metrics-grid">
            <MetricTile label="Total Return"  value={run.totalReturn} />
            <MetricTile label="Sharpe Ratio"  value={String(run.sharpe)} />
            <MetricTile label="Max Drawdown"  value={run.maxDrawdown} />
            <MetricTile label="Win Rate"      value={run.winRate} />
            <MetricTile label="Trades"        value={String(run.trades)} />
            <MetricTile label="Avg Duration"  value={run.avgDuration} />
          </div>

          {/* Mini equity curve */}
          {run.equityCurve.length > 0 && (
            <div>
              <p className="detail-section-title">Equity Curve</p>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={run.equityCurve}>
                  <defs>
                    <linearGradient id="panelEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) => [
                      `$${(v ?? 0).toLocaleString()}`,
                      'Portfolio Value',
                    ]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#panelEquityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trade log */}
          {run.tradeLog.length > 0 && (
            <div>
              <p className="detail-section-title">Trade Log</p>
              <div className="table-scroll">
                <table className="trade-log-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>Side</th>
                      <th>Entry $</th>
                      <th>Exit $</th>
                      <th>P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.tradeLog.map((t) => (
                      <tr key={t.tradeId}>
                        <td><span className="run-id">{t.tradeId}</span></td>
                        <td className="text-muted">{t.entryDate}</td>
                        <td className="text-muted">{t.exitDate}</td>
                        <td>
                          <span className={t.side === 'Long' ? 'return-pos' : 'return-neg'}>
                            {t.side}
                          </span>
                        </td>
                        <td className="fw-600">{t.entryPrice.toLocaleString()}</td>
                        <td className="fw-600">{t.exitPrice.toLocaleString()}</td>
                        <td>
                          <span className={t.pnl >= 0 ? 'return-pos' : 'return-neg'}>
                            {t.pnlPct}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function FilterBar({
  symbolFilter,
  setSymbolFilter,
  statusFilter,
  setStatusFilter,
}: {
  symbolFilter:    string
  setSymbolFilter: (v: string) => void
  statusFilter:    string
  setStatusFilter: (v: string) => void
}) {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Symbol</span>
      <select
        className="filter-select"
        value={symbolFilter}
        onChange={(e) => setSymbolFilter(e.target.value)}
      >
        <option>All</option>
        <option>BTC/USD</option>
        <option>ETH/USD</option>
        <option>SOL/USD</option>
      </select>
      <div className="filter-bar__separator" />
      <span className="filter-bar__label">Status</span>
      <select
        className="filter-select"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="All">All</option>
        <option value="complete">Complete</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  )
}

function StrategyPerfSection() {
  const maxReturn = Math.max(...strategyPerfData.map((s) => Math.abs(s.returnNum)))
  const maxSharpe = Math.max(...strategyPerfData.map((s) => s.sharpe))

  return (
    <div className="strategy-perf-card">
      <div className="table-header">
        <div>
          <h2>Strategy Performance</h2>
          <span className="chart-sub">Side-by-side comparison · all runs</span>
        </div>
      </div>
      <table className="strategy-perf-table">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Symbol</th>
            <th>Return</th>
            <th>Sharpe</th>
            <th>Max Drawdown</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {strategyPerfData.map((s) => (
            <tr key={s.strategy}>
              <td><span className="strategy-name">{s.strategy}</span></td>
              <td><span className="symbol-badge">{s.symbol}</span></td>
              <td>
                <div className="perf-bar-cell">
                  <div
                    className={`perf-bar${s.returnNum < 0 ? ' perf-bar--negative' : ''}`}
                    style={{ width: `${(Math.abs(s.returnNum) / maxReturn) * 80}px` }}
                  />
                  <span className={`perf-bar-label ${s.returnNum >= 0 ? 'return-pos' : 'return-neg'}`}>
                    {s.totalReturn}
                  </span>
                </div>
              </td>
              <td>
                <div className="perf-bar-cell">
                  <div
                    className="perf-bar"
                    style={{ width: `${(s.sharpe / maxSharpe) * 80}px` }}
                  />
                  <span className="perf-bar-label fw-600">{s.sharpe}</span>
                </div>
              </td>
              <td><span className="return-neg">{s.maxDrawdown}</span></td>
              <td className="fw-600">{s.winRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  // Mutable run list so new submissions are reflected immediately
  const [runs, setRuns] = useState<BacktestRun[]>(recentRuns)

  // Detail panel
  const [selectedRun, setSelectedRun] = useState<BacktestRun | null>(null)

  // New Backtest modal
  const [showModal, setShowModal] = useState(false)

  // Stat card → row highlight
  const [highlightedRunId, setHighlightedRunId] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Equity curve run selector
  const [selectedEquityRunId, setEquityRunId] = useState('BT-001')

  // Monthly bar highlight
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Table filters
  const [symbolFilter, setSymbolFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // ── Derived ──────────────────────────────────────────────────────────────

  const filteredRuns = runs.filter(
    (r) =>
      (symbolFilter === 'All' || r.symbol === symbolFilter) &&
      (statusFilter === 'All' || r.status === statusFilter),
  )

  const equityData =
    runs.find((r) => r.id === selectedEquityRunId)?.equityCurve ?? equityCurveData

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleStatCardClick(runId: string) {
    setHighlightedRunId(runId)
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setHighlightedRunId(null), 3000)
  }

  function handleNewBacktestSubmit(config: NewBacktestConfig) {
    const nextId = `BT-${String(runs.length + 1).padStart(3, '0')}`
    const newRun: BacktestRun = {
      id:             nextId,
      strategy:       config.strategy,
      symbol:         config.symbol,
      period:         `${config.startDate} – ${config.endDate}`,
      startDate:      config.startDate,
      endDate:        config.endDate,
      initialCapital: config.initialCapital,
      commission:     config.commission,
      totalReturn:    '—',
      sharpe:         0,
      maxDrawdown:    '—',
      winRate:        '—',
      trades:         0,
      avgDuration:    '—',
      status:         'running',
      equityCurve:    [],
      tradeLog:       [],
    }
    setRuns((prev) => [newRun, ...prev])
    setShowModal(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlays — rendered first so they stack above everything */}
      {selectedRun && (
        <DetailPanel run={selectedRun} onClose={() => setSelectedRun(null)} />
      )}
      {showModal && (
        <NewBacktestModal onSubmit={handleNewBacktestSubmit} onClose={() => setShowModal(false)} />
      )}

      {/* Page heading */}
      <section className="page-heading">
        <div>
          <h1>Good morning, Team</h1>
          <p>
            FightClub backtesting engine · {runs.length} total runs ·{' '}
            {runs.filter((r) => r.status === 'running').length} running
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          New Backtest <ChevronRight size={14} />
        </button>
      </section>

      {/* Stat cards */}
      <div className="cards-grid">
        <StatCard
          title="Best Total Return"
          value="+28.9%"
          sub="SMA Crossover · BTC/USD"
          colorClass="stat-card--yellow"
          icon={<TrendingUp size={16} />}
          onClick={() => handleStatCardClick('BT-001')}
        />
        <StatCard
          title="Best Sharpe Ratio"
          value="1.84"
          sub="SMA Crossover · Jan–Mar 2024"
          colorClass="stat-card--pink"
          icon={<Activity size={16} />}
          onClick={() => handleStatCardClick('BT-001')}
        />
        <StatCard
          title="Lowest Max Drawdown"
          value="-5.9%"
          sub="MACD Trend Follow · BTC/USD"
          colorClass="stat-card--green"
          icon={<ShieldCheck size={16} />}
          onClick={() => handleStatCardClick('BT-004')}
        />
        <StatCard
          title="Backtests Run"
          value={String(runs.length)}
          sub={`${new Set(runs.map((r) => r.symbol)).size} symbols · ${new Set(runs.map((r) => r.strategy)).size} strategies`}
          colorClass="stat-card--blue"
          icon={<BarChart2 size={16} />}
        />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Equity curve with run selector + drawdown overlay */}
        <div className="chart-card chart-card--wide">
          <div className="chart-header">
            <div>
              <h2>Equity Curve</h2>
              <span className="chart-sub">
                {runs.find((r) => r.id === selectedEquityRunId)?.strategy} ·{' '}
                {runs.find((r) => r.id === selectedEquityRunId)?.symbol}
              </span>
            </div>
            <div className="chart-controls">
              <select
                className="chart-select"
                value={selectedEquityRunId}
                onChange={(e) => setEquityRunId(e.target.value)}
              >
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} · {r.strategy}
                  </option>
                ))}
              </select>
              <span className="badge badge--green">
                {runs.find((r) => r.id === selectedEquityRunId)?.totalReturn ?? '—'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#f87171' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={['auto', 0]}
              />
              <Tooltip
                formatter={(v: number | undefined, name: string | undefined) =>
                  name === 'value'
                    ? [`$${(v ?? 0).toLocaleString()}`, 'Portfolio Value']
                    : [`${(v ?? 0).toFixed(2)}%`, 'Drawdown']
                }
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill="url(#equityGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="drawdown"
                stroke="#f87171"
                strokeWidth={1.5}
                fill="url(#drawdownGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly returns — bars colored by pos/neg, clickable */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Monthly Returns</h2>
              <span className="chart-sub">All strategies · 2024</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyReturnsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Return']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar
                dataKey="return"
                radius={[4, 4, 0, 0]}
                onClick={(data: BarRectangleItem) =>
                  setSelectedMonth((prev) => {
                    const month = (data as BarRectangleItem & { month: string }).month
                    return prev === month ? null : month
                  })
                }
              >
                {monthlyReturnsData.map((entry) => {
                  const isSelected = entry.month === selectedMonth
                  const isPos = entry.return >= 0
                  const fill = isSelected
                    ? isPos ? BAR_COLOR_POS_SELECTED : BAR_COLOR_NEG_SELECTED
                    : isPos ? BAR_COLOR_POS          : BAR_COLOR_NEG
                  return <Cell key={entry.month} fill={fill} cursor="pointer" />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy performance comparison */}
      <StrategyPerfSection />

      {/* Filter bar + runs table */}
      <div className="table-card" ref={tableRef}>
        <div className="table-header">
          <div>
            <h2>Recent Backtest Runs</h2>
            <span className="chart-sub">
              {filteredRuns.length} of {runs.length} runs · click a row for details
            </span>
          </div>
          <button className="btn-ghost">Export CSV</button>
        </div>

        <FilterBar
          symbolFilter={symbolFilter}
          setSymbolFilter={setSymbolFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <div className="table-scroll">
          <table className="runs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Strategy</th>
                <th>Symbol</th>
                <th>Period</th>
                <th>Total Return</th>
                <th>Sharpe</th>
                <th>Max Drawdown</th>
                <th>Win Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  className={`runs-table__row${run.id === highlightedRunId ? ' runs-table__row--highlighted' : ''}`}
                  onClick={() => setSelectedRun(run)}
                >
                  <td><span className="run-id">{run.id}</span></td>
                  <td><span className="strategy-name">{run.strategy}</span></td>
                  <td><span className="symbol-badge">{run.symbol}</span></td>
                  <td className="text-muted">{run.period}</td>
                  <td>
                    <span className={run.totalReturn.startsWith('+') ? 'return-pos' : 'return-neg'}>
                      {run.totalReturn}
                    </span>
                  </td>
                  <td className="fw-600">{run.sharpe || '—'}</td>
                  <td><span className="return-neg">{run.maxDrawdown}</span></td>
                  <td className="fw-600">{run.winRate}</td>
                  <td><StatusDot status={run.status} /></td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                    No runs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
