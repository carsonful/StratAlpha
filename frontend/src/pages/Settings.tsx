import { useState } from 'react'
import SlippageSettings from '../components/SlippageSettings'

export default function Settings() {
  // Local UI state for demo purposes — in a full app these would be persisted
  const [model, setModel] = useState<string>('volatility')
  const [pct, setPct] = useState<number>(0.1)
  const [volatilityScale, setVolatilityScale] = useState<boolean>(true)
  const [volumeScale, setVolumeScale] = useState<boolean>(false)

  return (
    <div className="page-settings">
      <h1>Settings</h1>
      <p>Configure default backtest and execution model settings.</p>

      <section className="panel">
        <h3>Slippage & Execution</h3>
        <SlippageSettings
          model={model}
          pct={pct}
          volatilityScale={volatilityScale}
          volumeScale={volumeScale}
          onModelChange={setModel}
          onPctChange={setPct}
          onVolatilityToggle={setVolatilityScale}
          onVolumeToggle={setVolumeScale}
        />
      </section>
    </div>
  )
}
