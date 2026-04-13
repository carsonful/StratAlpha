import { useState } from 'react'
import { Activity, AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Mock VaR and drawdown stats per strategy
const varByStrategy = [
  { strategy: 'SMA Crossover',      var95: 4.2,  var99: 7.8,  maxDD: 8.1  },
  { strategy: 'RSI Mean Reversion', var95: 6.5,  var99: 11.2, maxDD: 14.3 },
  { strategy: 'Bollinger Breakout', var95: 9.1,  var99: 15.4, maxDD: 21.7 },
  { strategy: 'MACD Trend Follow',  var95: 3.8,  var99: 6.9,  maxDD: 5.9  },
]

// Capital-at-risk allocation per strategy (%)
const allocationData = [
  { name: 'SMA Crossover',      value: 35, color: '#818cf8' },
  { name: 'MACD Trend Follow',  value: 30, color: '#34d399' },
  { name: 'RSI Mean Reversion', value: 22, color: '#fbbf24' },
  { name: 'Bollinger Breakout', value: 13, color: '#f472b6' },
]

// 4×4 Pearson correlation matrix of daily returns
const STRATS = ['SMA Cross', 'RSI Mean', 'Bollinger', 'MACD']
const CORR: number[][] = [
  [ 1.00,  0.42, -0.18,  0.65],
  [ 0.42,  1.00,  0.23,  0.31],
  [-0.18,  0.23,  1.00, -0.09],
  [ 0.65,  0.31, -0.09,  1.00],
]

// Background color for a correlation cell (green = positive, red = negative, intensity = magnitude)
function corrBg(v: number): string {
  if (v >= 1)  return 'rgba(129, 140, 248, 0.25)'
  if (v > 0)   return `rgba(52, 211, 153, ${(v * 0.55).toFixed(2)})`
  return `rgba(248, 113, 113, ${(Math.abs(v) * 0.55).toFixed(2)})`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, colorClass, icon,
}: {
  label: string; value: string; sub?: string; colorClass: string; icon: React.ReactNode
}) {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-card__top">
        <span className="stat-card__title">{label}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <span className="stat-card__value">{value}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  )
}

// ── Risk Monitor page ─────────────────────────────────────────────────────────

export default function Risk() {
  const [activeSlice, setActiveSlice] = useState<string | null>(null)

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Risk Monitor</h1>
          <p>Portfolio risk metrics · VaR · max drawdown · strategy correlation</p>
        </div>
      </section>

      {/* Summary stat tiles */}
      <div className="cards-grid">
        <StatTile
          label="Portfolio VaR (95%)" value="−4.2%"
          sub="Daily loss threshold" colorClass="stat-card--yellow"
          icon={<AlertTriangle size={16} />}
        />
        <StatTile
          label="Portfolio VaR (99%)" value="−7.8%"
          sub="Extreme scenario" colorClass="stat-card--pink"
          icon={<ShieldCheck size={16} />}
        />
        <StatTile
          label="Avg Max Drawdown" value="−12.5%"
          sub="Across all strategies" colorClass="stat-card--blue"
          icon={<TrendingDown size={16} />}
        />
        <StatTile
          label="Avg Sortino Ratio" value="1.31"
          sub="Risk-adjusted upside" colorClass="stat-card--green"
          icon={<Activity size={16} />}
        />
      </div>

      {/* VaR bar chart + Risk allocation pie */}
      <div className="charts-row">
        <div className="chart-card chart-card--wide">
          <div className="chart-header">
            <div>
              <h2>VaR by Strategy</h2>
              <span className="chart-sub">95% and 99% confidence intervals</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={varByStrategy} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="strategy" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="var95" name="VaR 95%" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Bar dataKey="var99" name="VaR 99%" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Risk Allocation</h2>
              <span className="chart-sub">Capital at risk per strategy</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                onClick={(d: { name: string }) =>
                  setActiveSlice((prev) => (prev === d.name ? null : d.name))
                }
              >
                {allocationData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={activeSlice && activeSlice !== entry.name ? 0.35 : 1}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Allocation']}
                contentStyle={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Max drawdown horizontal bar */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2>Max Drawdown by Strategy</h2>
            <span className="chart-sub">Worst peak-to-trough loss · green &lt; 10% · yellow 10–15% · red &gt; 15%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={varByStrategy} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="strategy"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false} width={130}
            />
            <Tooltip
              formatter={(v: number) => [`${v}%`, 'Max Drawdown']}
              contentStyle={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            />
            <Bar dataKey="maxDD" name="Max Drawdown" radius={[0, 4, 4, 0]}>
              {varByStrategy.map((entry) => (
                <Cell
                  key={entry.strategy}
                  fill={entry.maxDD > 15 ? '#f87171' : entry.maxDD > 10 ? '#fbbf24' : '#34d399'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy correlation matrix */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Strategy Correlation Matrix</h2>
            <span className="chart-sub">Pearson correlation of daily returns · lower = better diversification</span>
          </div>
        </div>
        <div className="table-scroll">
          <table className="corr-table">
            <thead>
              <tr>
                <th />
                {STRATS.map((s) => <th key={s}>{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {CORR.map((row, i) => (
                <tr key={STRATS[i]}>
                  <td className="corr-table__label">{STRATS[i]}</td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className="corr-table__cell"
                      style={{ background: corrBg(val) }}
                    >
                      {val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
