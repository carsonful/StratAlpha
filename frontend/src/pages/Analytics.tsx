import { useState } from 'react'
import { Activity, BarChart2, ShieldCheck, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BarRectangleItem } from 'recharts'
import { monthlyReturnsData, recentRuns } from '../data/mockData'

// ── Derived analytics data (computed once, outside the component) ──────────────

// Win and loss count per strategy
const winLossData = recentRuns.map((r) => {
  const wins   = Math.round((parseInt(r.winRate) / 100) * r.trades)
  const losses = r.trades - wins
  return { strategy: r.strategy.split(' ')[0], wins, losses }
})

// Return distribution bucketed into ranges
const returnDistData = [
  { bucket: '< 0%',   count: recentRuns.filter((r) => parseFloat(r.totalReturn) < 0).length },
  { bucket: '0–10%',  count: recentRuns.filter((r) => { const n = parseFloat(r.totalReturn); return n >= 0 && n < 10 }).length },
  { bucket: '10–20%', count: recentRuns.filter((r) => { const n = parseFloat(r.totalReturn); return n >= 10 && n < 20 }).length },
  { bucket: '> 20%',  count: recentRuns.filter((r) => parseFloat(r.totalReturn) >= 20).length },
]

// Drawdown timeline — BT-001 as the representative run
const drawdownData = recentRuns.find((r) => r.id === 'BT-001')!.equityCurve

// ── Sub-component ─────────────────────────────────────────────────────────────

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

// ── Analytics page ────────────────────────────────────────────────────────────

export default function Analytics() {
  // Monthly bar chart selection (local state, same pattern as Dashboard)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Aggregate stat card values
  const totalTrades   = recentRuns.reduce((s, r) => s + r.trades, 0)
  const overallWinRate = Math.round(
    recentRuns.reduce((s, r) => s + parseInt(r.winRate), 0) / recentRuns.length,
  )
  const bestMonth     = monthlyReturnsData.reduce((b, m) => m.return > b.return ? m : b)
  const worstDrawdown = recentRuns.reduce((b, r) =>
    parseFloat(r.maxDrawdown) < parseFloat(b.maxDrawdown) ? r : b
  )

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>Aggregate insights across all {recentRuns.length} backtest runs</p>
        </div>
      </section>

      {/* Summary stat cards */}
      <div className="cards-grid">
        <StatCard
          title="Total Trades" value={String(totalTrades)}
          sub={`Across ${recentRuns.length} runs`}
          colorClass="stat-card--blue" icon={<BarChart2 size={16} />}
        />
        <StatCard
          title="Overall Win Rate" value={`${overallWinRate}%`}
          sub="Weighted average"
          colorClass="stat-card--green" icon={<Activity size={16} />}
        />
        <StatCard
          title="Best Month" value={`+${bestMonth.return}%`}
          sub={`${bestMonth.month} 2024`}
          colorClass="stat-card--yellow" icon={<TrendingUp size={16} />}
        />
        <StatCard
          title="Worst Drawdown" value={worstDrawdown.maxDrawdown}
          sub={`${worstDrawdown.strategy} · ${worstDrawdown.symbol}`}
          colorClass="stat-card--pink" icon={<ShieldCheck size={16} />}
        />
      </div>

      {/* 2×2 analytics chart grid */}
      <div className="analytics-grid">

        {/* Win / Loss by strategy */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Win / Loss by Strategy</h2>
              <span className="chart-sub">Trade count breakdown per strategy</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={winLossData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="strategy" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="wins"   name="Wins"   fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" name="Losses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Return distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Return Distribution</h2>
              <span className="chart-sub">How many runs fell in each return range</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={returnDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(v: number | undefined) => [`${v ?? 0} run${(v ?? 0) !== 1 ? 's' : ''}`, 'Count']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {returnDistData.map((entry) => (
                  <Cell
                    key={entry.bucket}
                    fill={entry.bucket === '< 0%' ? '#fca5a5' : '#818cf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Drawdown timeline */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Drawdown Timeline</h2>
              <span className="chart-sub">SMA Crossover · BTC/USD (BT-001)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={drawdownData}>
              <defs>
                <linearGradient id="analyticsDrawdownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#f87171' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                domain={['auto', 0]}
              />
              <Tooltip
                formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)}%`, 'Drawdown']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="drawdown" stroke="#f87171" strokeWidth={2}
                fill="url(#analyticsDrawdownGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly returns — same as Dashboard, with local click-to-highlight state */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Monthly Returns</h2>
              <span className="chart-sub">All strategies · 2024</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyReturnsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${v}%`} />
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
                    ? isPos ? '#4f46e5' : '#dc2626'
                    : isPos ? '#818cf8' : '#fca5a5'
                  return <Cell key={entry.month} fill={fill} cursor="pointer" />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  )
}
