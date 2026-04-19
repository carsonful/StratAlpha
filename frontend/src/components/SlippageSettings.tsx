const MODEL_OPTIONS = [
  {
    value: "none",
    label: "None",
    description: "No slippage applied to trades",
  },
  {
    value: "fixed",
    label: "Fixed %",
    description: "Flat percentage cost on every trade",
  },
  {
    value: "volatility",
    label: "Volatility-scaled",
    description: "Scales with realized volatility of the asset",
  },
  {
    value: "volume",
    label: "Volume-scaled",
    description: "Scales with trade size relative to ADV",
  },
  {
    value: "volatility_volume",
    label: "Volatility + Volume",
    description: "Combines both volatility and volume scaling",
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track" />
    </label>
  );
}

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
  model: string;
  pct: number;
  volatilityScale: boolean;
  volumeScale: boolean;
  onModelChange: (v: string) => void;
  onPctChange: (v: number) => void;
  onVolatilityToggle: (v: boolean) => void;
  onVolumeToggle: (v: boolean) => void;
}) {
  const selected = MODEL_OPTIONS.find((o) => o.value === model);
  const showBase = model !== "none";
  const showVolScale = ["volatility", "volatility_volume"].includes(model);
  const showVolScale2 = ["volume", "volatility_volume"].includes(model);

  return (
    <>
      {/* Model selector */}
      <div className="settings-field">
        <label className="settings-label">Slippage model</label>
        <select
          className="settings-select"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {MODEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {selected && (
          <span className="settings-hint">{selected.description}</span>
        )}
      </div>

      {/* Base slippage */}
      {showBase && (
        <div className="settings-field">
          <label className="settings-label">Base slippage</label>
          <div className="settings-number-wrap">
            <input
              type="number"
              className="settings-number"
              value={pct}
              min={0}
              max={10}
              step={0.01}
              onChange={(e) => onPctChange(Number(e.target.value))}
            />
            <span className="settings-number-suffix">%</span>
          </div>
          <span className="settings-hint">
            Baseline cost applied to every trade before scaling
          </span>
        </div>
      )}

      {/* Scaling toggles */}
      {(showVolScale || showVolScale2) && (
        <div className="settings-scales">
          <p className="settings-scales__title">Scaling factors</p>

          {showVolScale && (
            <div className="settings-toggle-row">
              <div className="settings-toggle-row__text">
                <p>Volatility scale</p>
                <span>
                  Multiplies slippage by the asset's recent realized volatility
                </span>
              </div>
              <Toggle checked={volatilityScale} onChange={onVolatilityToggle} />
            </div>
          )}

          {showVolScale2 && (
            <div className="settings-toggle-row">
              <div className="settings-toggle-row__text">
                <p>Volume scale</p>
                <span>
                  Increases slippage when trade size is large relative to ADV
                </span>
              </div>
              <Toggle checked={volumeScale} onChange={onVolumeToggle} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
