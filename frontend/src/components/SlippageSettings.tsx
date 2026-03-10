export default function SlippageSettings({
  model,
  pct,
  volatilityScale,
  volumeScale,
  onModelChange,
  onPctChange,
  onVolatilityToggle,
  onVolumeToggle,
}: {
  model: string
  pct: number
  volatilityScale: boolean
  volumeScale: boolean
  onModelChange: (v: string) => void
  onPctChange: (v: number) => void
  onVolatilityToggle: (v: boolean) => void
  onVolumeToggle: (v: boolean) => void
}) {
  return (
    <div className="slippage-settings">
      <div className="form-group">
        <label className="form-label">Slippage model</label>
        <select
          className="form-control"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
        >
          <option value="none">None</option>
          <option value="fixed">Fixed %</option>
          <option value="volatility">Volatility-scaled</option>
          <option value="volume">Volume-scaled</option>
          <option value="volatility_volume">Volatility + Volume</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Base slippage (%)</label>
          <input
            type="number"
            className="form-control"
            value={pct}
            min={0}
            max={10}
            step={0.01}
            onChange={(e) => onPctChange(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Volatility scale</label>
          <input
            type="checkbox"
            checked={volatilityScale}
            onChange={(e) => onVolatilityToggle(e.target.checked)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Volume scale</label>
          <input
            type="checkbox"
            checked={volumeScale}
            onChange={(e) => onVolumeToggle(e.target.checked)}
          />
        </div>
      </div>
    </div>
  )
}
