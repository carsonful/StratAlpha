import { useState } from "react";
import SlippageSettings from "../components/SlippageSettings";

function Toast({ onClose }: { onClose: () => void }) {
  return (
    <div className="settings-toast">
      <svg
        className="settings-toast__icon"
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
      Settings saved successfully
      <button
        onClick={onClose}
        style={{
          marginLeft: 8,
          color: "#ffffff88",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function Settings() {
  const [model, setModel] = useState<string>("volatility");
  const [pct, setPct] = useState<number>(0.1);
  const [volatilityScale, setVolatilityScale] = useState<boolean>(true);
  const [volumeScale, setVolumeScale] = useState<boolean>(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="page-settings">
      <div>
        <h1>Settings</h1>
        <p>Configure default backtest and execution model settings.</p>
      </div>

      <div className="settings-card">
        <div className="settings-card__header">
          <h2>Slippage & Execution</h2>
          <p>Controls how transaction costs are modelled in backtests</p>
        </div>
        <div className="settings-card__body">
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
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn-save" onClick={handleSave}>
          Save settings
        </button>
      </div>

      {saved && <Toast onClose={() => setSaved(false)} />}
    </div>
  );
}
