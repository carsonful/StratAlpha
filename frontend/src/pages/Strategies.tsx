import { useState } from 'react'
import { Activity, BarChart2, ShieldCheck, TrendingUp, X } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { recentRuns, strategyDetailData } from '../data/mockData'
import type { StrategyDetail } from '../types'

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

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-metric">
      <span className="detail-metric__label">{label}</span>
      <span className="detail-metric__value">{value}</span>
    </div>
  )
}

// Strategy card with mini equity sparkline
function StrategyCard({
  strategy, isActive, onClick,
}: {
  strategy: StrategyDetail; isActive: boolean; onClick: () => void
}) {
  // Unique gradient ID per card to avoid SVG defs collision
  const gradId = `stratGrad_${strategy.strategy.replace(/\s+/g, '_')}`

  return (
    <div
      className={`strategy-card${isActive ? ' strategy-card--active' : ''}`}
      onClick={onClick}
    >
      <div className="strategy-card__header">
        <div>
          <div className="strategy-card__title">{strategy.strategy}</div>
          <div className="strategy-card__runs">{strategy.runs} run{strategy.runs !== 1 ? 's' : ''}</div>
        </div>
        <span className="symbol-badge">{strategy.symbol}</span>
      </div>

      <div className="strategy-card__metrics">
        <div className="strategy-card__metric">
          <span className="strategy-card__metric-label">Total Return</span>
          <span className={`strategy-card__metric-value ${strategy.returnNum >= 0 ? 'return-pos' : 'return-neg'}`}>
            {strategy.totalReturn}
          </span>
        </div>
        <div className="strategy-card__metric">
          <span className="strategy-card__metric-label">Sharpe Ratio</span>
          <span className="strategy-card__metric-value">{strategy.sharpe}</span>
        </div>
        <div className="strategy-card__metric">
          <span className="strategy-card__metric-label">Max Drawdown</span>
          <span className="strategy-card__metric-value return-neg">{strategy.maxDrawdown}</span>
        </div>
        <div className="strategy-card__metric">
          <span className="strategy-card__metric-label">Win Rate</span>
          <span className="strategy-card__metric-value">{strategy.winRate}</span>
        </div>
      </div>

      {/* Mini sparkline — no axes or grid for a clean preview look */}
      <div>
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={strategy.equityCurve} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fill={`url(#${gradId})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Slide-in detail panel for a selected strategy
function StrategyDetailPanel({
  strategy, onClose,
}: {
  strategy: StrategyDetail; onClose: () => void
}) {
  // Runs that used this strategy
  const strategyRuns = recentRuns.filter((r) => r.strategy === strategy.strategy)

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-panel__header">
          <h2>{strategy.strategy}</h2>
          <button className="detail-panel__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="detail-panel__body">
          <div className="detail-metrics-grid">
            <MetricTile label="Total Return"  value={strategy.totalReturn} />
            <MetricTile label="Sharpe Ratio"  value={String(strategy.sharpe)} />
            <MetricTile label="Max Drawdown"  value={strategy.maxDrawdown} />
            <MetricTile label="Win Rate"      value={strategy.winRate} />
            <MetricTile label="Runs"          value={String(strategy.runs)} />
            <MetricTile label="Symbol"        value={strategy.symbol} />
          </div>

          <p className="detail-section-title">Equity Curve</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={strategy.equityCurve}>
              <defs>
                <linearGradient id="stratPanelGrad" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fill="url(#stratPanelGrad)" />
            </AreaChart>
          </ResponsiveContainer>

          {strategyRuns.length > 0 && (
            <>
              <p className="detail-section-title">Backtest Runs</p>
              <div className="table-scroll">
                <table className="trade-log-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Symbol</th><th>Period</th><th>Return</th><th>Sharpe</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyRuns.map((r) => (
                      <tr key={r.id}>
                        <td><span className="run-id">{r.id}</span></td>
                        <td><span className="symbol-badge">{r.symbol}</span></td>
                        <td className="text-muted">{r.period}</td>
                        <td>
                          <span className={r.totalReturn.startsWith('+') ? 'return-pos' : 'return-neg'}>
                            {r.totalReturn}
                          </span>
                        </td>
                        <td className="fw-600">{r.sharpe || '—'}</td>
                        <td className="text-muted">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

// ── Strategies page ───────────────────────────────────────────────────────────

export default function Strategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyDetail | null>(null)

  const bestSharpe  = strategyDetailData.reduce((b, s) => s.sharpe > b.sharpe ? s : b)
  const bestReturn  = strategyDetailData.reduce((b, s) => s.returnNum > b.returnNum ? s : b)
  const bestDrawdown = strategyDetailData.reduce((b, s) => {
    const bNum = parseFloat(b.maxDrawdown)
    const sNum = parseFloat(s.maxDrawdown)
    return sNum > bNum ? s : b  // closer to 0 = better
  })

  return (
    <>
      {selectedStrategy && (
        <StrategyDetailPanel strategy={selectedStrategy} onClose={() => setSelectedStrategy(null)} />
      )}

      <section className="page-heading">
        <div>
          <h1>Strategies</h1>
          <p>{strategyDetailData.length} strategies · click a card for details</p>
        </div>
      </section>

      <div className="cards-grid">
        <StatCard
          title="Best Sharpe" value={String(bestSharpe.sharpe)}
          sub={bestSharpe.strategy}
          colorClass="stat-card--pink" icon={<Activity size={16} />}
        />
        <StatCard
          title="Best Return" value={bestReturn.totalReturn}
          sub={`${bestReturn.strategy} · ${bestReturn.symbol}`}
          colorClass="stat-card--yellow" icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Lowest Drawdown" value={bestDrawdown.maxDrawdown}
          sub={bestDrawdown.strategy}
          colorClass="stat-card--green" icon={<ShieldCheck size={16} />}
        />
        <StatCard
          title="Total Strategies" value={String(strategyDetailData.length)}
          sub="Across all symbols"
          colorClass="stat-card--blue" icon={<BarChart2 size={16} />}
        />
      </div>

      <div className="strategy-cards-grid">
        {strategyDetailData.map((s) => (
          <StrategyCard
            key={s.strategy}
            strategy={s}
            isActive={selectedStrategy?.strategy === s.strategy}
            onClick={() =>
              setSelectedStrategy((prev) => prev?.strategy === s.strategy ? null : s)
            }
          />
        ))}
      </div>
    </>
  )
}
