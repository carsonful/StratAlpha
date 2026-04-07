import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BlocklyWorkspace } from "react-blockly"
import * as Blockly from "blockly"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const TOOLBOX = {
  kind: "flyoutToolbox",
  contents: [
    { kind: "block", type: "controls_if" },
    { kind: "block", type: "logic_compare" },
    { kind: "block", type: "math_number" },
    { kind: "block", type: "math_arithmetic" },
    { kind: "block", type: "text" },
    { kind: "block", type: "text_print" },
    { kind: "block", type: "variables_get" },
    { kind: "block", type: "variables_set" },
  ],
}

export default function Block() {
  const navigate = useNavigate()
  const [xml, setXml] = useState("")
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleProcessBlocks() {
    if (!workspace) return
    setError(null)
    setLoading(true)

    try {
      const workspaceJson = Blockly.serialization.workspaces.save(workspace)
      const res = await fetch(`${API_URL}/process-blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace: workspaceJson }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data = await res.json()
      navigate("/backtests", { state: { result: data } })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach backend")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <section className="page-heading">
        <div>
          <h1>Block Editor</h1>
          <p>Build a strategy visually · click Process to run it on the backend</p>
        </div>
        <button className="btn-primary" onClick={handleProcessBlocks} disabled={loading}>
          {loading ? "Processing…" : "Process Blocks"}
        </button>
      </section>

      {error && (
        <div style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <BlocklyWorkspace
          className="blockly-workspace"
          toolboxConfiguration={TOOLBOX}
          initialXml={xml}
          workspaceConfiguration={{
            grid: { spacing: 20, length: 3, colour: "#1e293b", snap: true },
            theme: {
              name: "dark",
              base: Blockly.Themes.Classic,
              componentStyles: {
                workspaceBackgroundColour: "#0f1629",
                toolboxBackgroundColour: "#060a14",
                toolboxForegroundColour: "#94a3b8",
                flyoutBackgroundColour: "#0a0f1e",
                flyoutForegroundColour: "#cbd5e1",
                flyoutOpacity: 1,
                scrollbarColour: "#1e293b",
                insertionMarkerColour: "#818cf8",
                cursorColour: "#818cf8",
              },
            },
          }}
          onXmlChange={setXml}
          onInject={(ws) => setWorkspace(ws as Blockly.WorkspaceSvg)}
        />
      </div>
    </div>
  )
}
