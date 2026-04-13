import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import './App.css'
import './blocks/index'
import toolbox from './toolbox'
import ConfigPanel from './ConfigPanel'

const DEFAULT_CONFIG = {
  resolution: 'daily',
  startDate: '2020-01-01',
  endDate: '2024-12-31',
  initialCash: 100000,
  maxPositions: 1,
}

function App() {
  const blocklyDivRef = useRef(null)
  const workspaceRef = useRef(null)
  const [strategyJson, setStrategyJson] = useState('')
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox,
      renderer: 'zelos',
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#ddd', snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    })

    const syncPreview = () => {
      const state = Blockly.serialization.workspaces.save(
        workspaceRef.current,
      )
      setStrategyJson(JSON.stringify(state, null, 2))
    }

    workspaceRef.current.addChangeListener(syncPreview)
    syncPreview()

    return () => {
      workspaceRef.current?.dispose()
      workspaceRef.current = null
    }
  }, [])

  return (
    <div className="page">
      <header className="topbar">
        <h1>Blockly Strategy Builder</h1>
      </header>
      <main className="canvas-area">
        <div className="workspace" ref={blocklyDivRef} />
        <div className="floating-config">
          <ConfigPanel config={config} onChange={setConfig} />
        </div>
      </main>
    </div>
  )
}

export default App
