import { useState } from 'react'
import { BarChart2, TrendingDown, TrendingUp } from 'lucide-react'
import { ohlcvData } from '../data/mockData'

// ── Sub-components ────────────────────────────────────────────────────────────

// Stat tile for the OHLCV summary row (Highest Close, Lowest Close, Avg Volume)
function OHLCVStatTile({
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

// ── Data page ─────────────────────────────────────────────────────────────────

export default function Data() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD')

  const candles      = ohlcvData[selectedSymbol]
  const highestClose = Math.max(...candles.map((c) => c.close))
  const lowestClose  = Math.min(...candles.map((c) => c.close))
  const avgVolume    = (candles.reduce((s, c) => s + c.volume, 0) / candles.length).toFixed(2)
  const dateRange    = `${candles[0].date} – ${candles[candles.length - 1].date}`

  // Determine the unit label for volume based on symbol
  const volumeUnit = selectedSymbol.split('/')[0]

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Market Data</h1>
          <p>{selectedSymbol} · {dateRange} · {candles.length} candles</p>
        </div>
        {/* Symbol selector controls the whole page view */}
        <select
          className="chart-select"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
        >
          <option>BTC/USD</option>
          <option>ETH/USD</option>
          <option>SOL/USD</option>
        </select>
      </section>

      {/* Summary stats for the selected symbol */}
      <div className="ohlcv-stats-row">
        <OHLCVStatTile
          label="Highest Close"
          value={`$${highestClose.toLocaleString()}`}
          sub={`Over ${candles.length} candles`}
          colorClass="stat-card--yellow"
          icon={<TrendingUp size={16} />}
        />
        <OHLCVStatTile
          label="Lowest Close"
          value={`$${lowestClose.toLocaleString()}`}
          sub={`Over ${candles.length} candles`}
          colorClass="stat-card--pink"
          icon={<TrendingDown size={16} />}
        />
        <OHLCVStatTile
          label="Avg Volume"
          value={`${avgVolume} ${volumeUnit}`}
          sub="Per candle average"
          colorClass="stat-card--blue"
          icon={<BarChart2 size={16} />}
        />
      </div>

      {/* OHLCV candlestick table */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>OHLCV Data</h2>
            <span className="chart-sub">{selectedSymbol} · {candles.length} candles</span>
          </div>
        </div>
        <div className="table-scroll">
          <table className="ohlcv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">Open</th>
                <th className="num">High</th>
                <th className="num">Low</th>
                <th className="num">Close</th>
                <th className="num">Volume ({volumeUnit})</th>
              </tr>
            </thead>
            <tbody>
              {candles.map((c) => (
                <tr key={c.date}>
                  <td className="fw-600">{c.date}</td>
                  <td className="num">{c.open.toLocaleString()}</td>
                  {/* Highlight the highest and lowest close prices in the dataset */}
                  <td className={`num${c.close === highestClose ? ' ohlcv-candle-high' : ''}`}>
                    {c.high.toLocaleString()}
                  </td>
                  <td className={`num${c.close === lowestClose ? ' ohlcv-candle-low' : ''}`}>
                    {c.low.toLocaleString()}
                  </td>
                  <td className={`num fw-600${c.close === highestClose ? ' ohlcv-candle-high' : c.close === lowestClose ? ' ohlcv-candle-low' : ''}`}>
                    {c.close.toLocaleString()}
                  </td>
                  <td className="num text-muted">{c.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
