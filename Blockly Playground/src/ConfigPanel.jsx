export default function ConfigPanel({ config, onChange }) {
  const update = (key, value) => onChange({ ...config, [key]: value })

  return (
    <div className="config-panel">
      <h2>Backtest Settings</h2>

      <label className="config-field">
        <span>Resolution</span>
        <select
          value={config.resolution}
          onChange={(e) => update('resolution', e.target.value)}
        >
          <option value="minute">1 Minute</option>
          <option value="5minute">5 Minute</option>
          <option value="15minute">15 Minute</option>
          <option value="30minute">30 Minute</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
        </select>
      </label>

      <label className="config-field">
        <span>Start Date</span>
        <input
          type="date"
          value={config.startDate}
          onChange={(e) => update('startDate', e.target.value)}
        />
      </label>

      <label className="config-field">
        <span>End Date</span>
        <input
          type="date"
          value={config.endDate}
          onChange={(e) => update('endDate', e.target.value)}
        />
      </label>

      <label className="config-field">
        <span>Initial Cash</span>
        <input
          type="number"
          min="0"
          value={config.initialCash}
          onChange={(e) => update('initialCash', Number(e.target.value))}
        />
      </label>

      <label className="config-field">
        <span>Max Positions</span>
        <input
          type="number"
          min="1"
          value={config.maxPositions}
          onChange={(e) => update('maxPositions', Number(e.target.value))}
        />
      </label>
    </div>
  )
}
