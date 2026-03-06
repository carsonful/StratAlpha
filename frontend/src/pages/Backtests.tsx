import { useState } from 'react'
import { Activity, BarChart2, ChevronRight, TrendingUp, X } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import NewBacktestModal from '../components/NewBacktestModal'
import { recentRuns } from '../data/mockData'
import type { BacktestRun, NewBacktestConfig } from '../types'

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, colorClass, icon,
}: {
  title: string; value: string; sub: string; colorClass: string; icon: React.ReactNode
}) {
  return (
    <div className={`stat-card ${colorClass}`}>
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
    status === 'complete' ? 'status-dot--complete'
    : status === 'running' ? 'status-dot--running'
    : 'status-dot--failed'
  const label = status === 'complete' ? 'Complete' : status === 'running' ? 'Running' : 'Failed'
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

// Slide-in detail panel for a selected run
function DetailPanel({ run, onClose }: { run: BacktestRun; onClose: () => void }) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-panel__header">
          <h2>{run.id} · {run.strategy}</h2>
          <button className="detail-panel__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="detail-panel__body">
          <div className="detail-metrics-grid">
            <MetricTile label="Total Return"   value={run.totalReturn} />
            <MetricTile label="Sharpe Ratio"   value={String(run.sharpe)} />
            <MetricTile label="Max Drawdown"   value={run.maxDrawdown} />
            <MetricTile label="Win Rate"       value={run.winRate} />
            <MetricTile label="Trades"         value={String(run.trades)} />
            <MetricTile label="Avg Duration"   value={run.avgDuration} />
          </div>

          {run.equityCurve.length > 0 && (
            <div>
              <p className="detail-section-title">Equity Curve</p>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={run.equityCurve}>
                  <defs>
                    <linearGradient id="btEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip
                    formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, 'Portfolio Value']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fill="url(#btEquityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {run.tradeLog.length > 0 && (
            <div>
              <p className="detail-section-title">Trade Log</p>
              <div className="table-scroll">
                <table className="trade-log-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Entry</th><th>Exit</th><th>Side</th>
                      <th>Entry $</th><th>Exit $</th><th>P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.tradeLog.map((t) => (
                      <tr key={t.tradeId}>
                        <td><span className="run-id">{t.tradeId}</span></td>
                        <td className="text-muted">{t.entryDate}</td>
                        <td className="text-muted">{t.exitDate}</td>
                        <td>
                          <span className={t.side === 'Long' ? 'return-pos' : 'return-neg'}>{t.side}</span>
                        </td>
                        <td className="fw-600">{t.entryPrice.toLocaleString()}</td>
                        <td className="fw-600">{t.exitPrice.toLocaleString()}</td>
                        <td>
                          <span className={t.pnl >= 0 ? 'return-pos' : 'return-neg'}>{t.pnlPct}</span>
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

// Symbol and status filter dropdowns
function FilterBar({
  symbolFilter, setSymbolFilter, statusFilter, setStatusFilter,
}: {
  symbolFilter: string; setSymbolFilter: (v: string) => void
  statusFilter: string; setStatusFilter: (v: string) => void
}) {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Symbol</span>
      <select className="filter-select" value={symbolFilter} onChange={(e) => setSymbolFilter(e.target.value)}>
        <option>All</option>
        <option>BTC/USD</option>
        <option>ETH/USD</option>
        <option>SOL/USD</option>
      </select>
      <div className="filter-bar__separator" />
      <span className="filter-bar__label">Status</span>
      <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="complete">Complete</option>
        <option value="running">Running</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  )
}

// ── Backtests page ────────────────────────────────────────────────────────────

export default function Backtests() {
  const [runs, setRuns] = useState<BacktestRun[]>(recentRuns)
  const [selectedRun, setSelectedRun] = useState<BacktestRun | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [symbolFilter, setSymbolFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredRuns = runs.filter(
    (r) =>
      (symbolFilter === 'All' || r.symbol === symbolFilter) &&
      (statusFilter === 'All' || r.status === statusFilter),
  )

  // Stat card computations (from all runs, not filtered)
  const avgWinRate = Math.round(
    runs.reduce((sum, r) => sum + parseInt(r.winRate), 0) / runs.length,
  )
  const bestRun = runs.reduce((best, r) =>
    parseFloat(r.totalReturn) > parseFloat(best.totalReturn) ? r : best, runs[0])
  const avgSharpe = (runs.reduce((sum, r) => sum + r.sharpe, 0) / runs.length).toFixed(2)

  function handleNewBacktestSubmit(config: NewBacktestConfig) {
    const nextId = `BT-${String(runs.length + 1).padStart(3, '0')}`
    const newRun: BacktestRun = {
      id: nextId, strategy: config.strategy, symbol: config.symbol,
      period: `${config.startDate} – ${config.endDate}`,
      startDate: config.startDate, endDate: config.endDate,
      initialCapital: config.initialCapital, commission: config.commission,
      totalReturn: '—', sharpe: 0, maxDrawdown: '—', winRate: '—',
      trades: 0, avgDuration: '—', status: 'running', equityCurve: [], tradeLog: [],
    }
    setRuns((prev) => [newRun, ...prev])
    setShowModal(false)
  }

  return (
    <>
      {selectedRun && <DetailPanel run={selectedRun} onClose={() => setSelectedRun(null)} />}
      {showModal && (
        <NewBacktestModal onSubmit={handleNewBacktestSubmit} onClose={() => setShowModal(false)} />
      )}

      <section className="page-heading">
        <div>
          <h1>All Backtest Runs</h1>
          <p>Full run history · {runs.length} total · {runs.filter((r) => r.status === 'running').length} running</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          New Backtest <ChevronRight size={14} />
        </button>
      </section>

      <div className="cards-grid">
        <StatCard
          title="Total Runs" value={String(runs.length)}
          sub={`${new Set(runs.map((r) => r.symbol)).size} symbols · ${new Set(runs.map((r) => r.strategy)).size} strategies`}
          colorClass="stat-card--blue" icon={<BarChart2 size={16} />}
        />
        <StatCard
          title="Avg Win Rate" value={`${avgWinRate}%`}
          sub="Across all completed runs"
          colorClass="stat-card--green" icon={<Activity size={16} />}
        />
        <StatCard
          title="Best Return" value={bestRun.totalReturn}
          sub={`${bestRun.strategy} · ${bestRun.symbol}`}
          colorClass="stat-card--yellow" icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Avg Sharpe" value={avgSharpe}
          sub="Risk-adjusted return"
          colorClass="stat-card--pink" icon={<Activity size={16} />}
        />
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Backtest Runs</h2>
            <span className="chart-sub">
              {filteredRuns.length} of {runs.length} runs · click a row for details
            </span>
          </div>
          <button className="btn-ghost">Export CSV</button>
        </div>

        <FilterBar
          symbolFilter={symbolFilter} setSymbolFilter={setSymbolFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
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
                <th>Trades</th>
                <th>Avg Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr key={run.id} className="runs-table__row" onClick={() => setSelectedRun(run)}>
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
                  <td className="fw-600">{run.trades || '—'}</td>
                  <td className="text-muted">{run.avgDuration}</td>
                  <td><StatusDot status={run.status} /></td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
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
