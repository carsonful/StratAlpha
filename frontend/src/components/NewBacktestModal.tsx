import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import type { NewBacktestConfig } from '../types'
import SlippageSettings from './SlippageSettings'

// Available options for the form dropdowns
const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD'] as const
const STRATEGIES = [
  'SMA Crossover',
  'RSI Mean Reversion',
  'Bollinger Breakout',
  'MACD Trend Follow',
] as const

type Symbol   = (typeof SYMBOLS)[number]
type Strategy = (typeof STRATEGIES)[number]

// Modal form for configuring and launching a new backtest
// onSubmit — called with form data when user clicks "Run Backtest"
// onClose  — called when user cancels or clicks outside the modal
export default function NewBacktestModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (config: NewBacktestConfig) => void
  onClose:  () => void
}) {
  // Form field state
  const [symbol,         setSymbol]         = useState<Symbol>('BTC/USD')
  const [startDate,      setStartDate]      = useState('2024-01-01')
  const [endDate,        setEndDate]        = useState('2024-03-31')
  const [strategy,       setStrategy]       = useState<Strategy>('SMA Crossover')
  const [initialCapital, setInitialCapital] = useState(10000)
  const [commission,     setCommission]     = useState(0.1)
  // Slippage controls (optional fields added to NewBacktestConfig)
  const [slippageModel, setSlippageModel] = useState<NewBacktestConfig['slippageModel']>('volatility')
  const [slippagePct,   setSlippagePct]   = useState<number>(0.1)
  const [volatilityScale, setVolatilityScale] = useState<boolean>(true)
  const [volumeScale, setVolumeScale] = useState<boolean>(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Prevent browser from reloading the page on form submit
    onSubmit({
      symbol,
      startDate,
      endDate,
      strategy,
      initialCapital,
      commission,
      slippageModel,
      slippagePct,
      volatilityScale,
      volumeScale,
    })
  }

  return (
    // Clicking the backdrop closes the modal; clicking inside does not (stopPropagation)
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>New Backtest</h2>
          <button className="detail-panel__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <select
                className="form-control"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value as Symbol)}
              >
                {SYMBOLS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Strategy</label>
              <select
                className="form-control"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as Strategy)}
              >
                {STRATEGIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Capital ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={initialCapital}
                  min={100}
                  step={100}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Commission (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={commission}
                  min={0}
                  max={5}
                  step={0.01}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="modal__section">
              <h3>Execution / Slippage</h3>
              <SlippageSettings
                model={slippageModel || 'none'}
                pct={slippagePct}
                volatilityScale={volatilityScale}
                volumeScale={volumeScale}
                onModelChange={(v) => setSlippageModel(v as NewBacktestConfig['slippageModel'])}
                onPctChange={(v) => setSlippagePct(v)}
                onVolatilityToggle={(v) => setVolatilityScale(v)}
                onVolumeToggle={(v) => setVolumeScale(v)}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Run Backtest <ChevronRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
