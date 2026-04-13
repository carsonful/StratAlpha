import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Blockly from 'blockly'
import '../blocks'
import toolbox from '../blocks/toolbox'
import ConfigPanel from '../components/ConfigPanel'
import type { BacktestConfig } from '../components/ConfigPanel'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LS_WORKSPACE_KEY = 'stratalpha:workspace'
const LS_CONFIG_KEY = 'stratalpha:config'

const DEFAULT_CONFIG: BacktestConfig = {
  resolution: 'daily',
  startDate: '2020-01-01',
  endDate: '2024-12-31',
  initialCash: 100000,
  maxPositions: 1,
}

function loadSavedConfig(): BacktestConfig {
  try {
    const raw = localStorage.getItem(LS_CONFIG_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch { /* corrupted — fall through */ }
  return DEFAULT_CONFIG
}

const WORKSPACE_THEME = Blockly.Theme.defineTheme('stratAlpha', {
  name: 'stratAlpha',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#f8f8f6',
    toolboxBackgroundColour: '#1a1a2e',
    toolboxForegroundColour: '#94a3b8',
    flyoutBackgroundColour: '#16162a',
    flyoutForegroundColour: '#cbd5e1',
    flyoutOpacity: 1,
    scrollbarColour: '#334155',
    insertionMarkerColour: '#818cf8',
    cursorColour: '#818cf8',
  },
})

interface BlockNode {
  type?: string
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: BlockNode }>
  next?: { block?: BlockNode }
  extraState?: Record<string, unknown>
}

function validateWorkspace(
  workspace: Record<string, unknown>,
  config: BacktestConfig,
): string[] {
  const errors: string[] = []
  const topBlocks = ((workspace.blocks as Record<string, unknown>)?.blocks ?? []) as BlockNode[]

  if (topBlocks.length === 0) {
    errors.push('Workspace is empty — add a Strategy root block to get started')
    return errors
  }

  const roots = topBlocks.filter((b) => b.type === 'strategy_root')
  if (roots.length === 0) {
    errors.push('Add a Strategy root block to define your symbol')
    return errors
  }
  if (roots.length > 1) {
    errors.push('Only one Strategy root block is allowed')
    return errors
  }

  const root = roots[0]
  const symbol = ((root.fields?.SYMBOL as string) ?? '').trim()
  if (!symbol) errors.push('Enter a ticker symbol in the Strategy root block')

  const strategyBlock = root.inputs?.STRATEGY?.block
  if (!strategyBlock) {
    errors.push('Your strategy is empty — add at least one When block inside the Strategy root')
    return errors
  }

  if (!treeHasType(strategyBlock, new Set(['order', 'liquidate']))) {
    errors.push('Your strategy has no order or liquidate blocks — it will never trade')
  }

  validateBlock(strategyBlock, errors)

  if (config.startDate && config.endDate && config.startDate >= config.endDate) {
    errors.push('Start date must be before end date')
  }
  if (config.initialCash <= 0) {
    errors.push('Initial cash must be positive')
  }

  return errors
}

function validateBlock(block: BlockNode | undefined, errors: string[]): void {
  if (!block) return
  const { type: btype, inputs } = block

  if (btype === 'when') {
    if (!inputs?.CONDITION?.block) errors.push('A When block is missing its condition')
    if (!inputs?.DO?.block) errors.push('A When block has no actions')
  } else if (btype === 'compare') {
    if (!inputs?.LEFT?.block) errors.push('A comparison block has an empty left input')
    if (!inputs?.RIGHT?.block) errors.push('A comparison block has an empty right input')
  } else if (btype === 'crosses') {
    if (!inputs?.A?.block) errors.push('A crosses block has an empty first input')
    if (!inputs?.B?.block) errors.push('A crosses block has an empty second input')
  } else if (btype === 'logic_and' || btype === 'logic_or') {
    if (!inputs?.A?.block) errors.push(`An ${btype === 'logic_and' ? 'AND' : 'OR'} block has an empty first input`)
    if (!inputs?.B?.block) errors.push(`An ${btype === 'logic_and' ? 'AND' : 'OR'} block has an empty second input`)
  } else if (btype === 'logic_not') {
    if (!inputs?.A?.block) errors.push('A NOT block has an empty input')
  }

  if (inputs) {
    for (const inp of Object.values(inputs)) {
      if (inp.block) validateBlock(inp.block, errors)
    }
  }
  if (block.next?.block) validateBlock(block.next.block, errors)
}

function treeHasType(block: BlockNode | undefined, types: Set<string>): boolean {
  if (!block) return false
  if (block.type && types.has(block.type)) return true
  if (block.inputs) {
    for (const inp of Object.values(block.inputs)) {
      if (treeHasType(inp.block, types)) return true
    }
  }
  return treeHasType(block.next?.block, types)
}

export default function Block() {
  const navigate = useNavigate()
  const blocklyDivRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const [config, setConfig] = useState<BacktestConfig>(loadSavedConfig)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!blocklyDivRef.current) return

    const ws = Blockly.inject(blocklyDivRef.current, {
      toolbox,
      renderer: 'zelos',
      theme: WORKSPACE_THEME,
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#e2e2df', snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
    })
    workspaceRef.current = ws

    try {
      const saved = localStorage.getItem(LS_WORKSPACE_KEY)
      if (saved) {
        Blockly.serialization.workspaces.load(JSON.parse(saved), ws)
      }
    } catch { /* corrupted or incompatible — start fresh */ }

    ws.addChangeListener(() => {
      try {
        const json = Blockly.serialization.workspaces.save(ws)
        localStorage.setItem(LS_WORKSPACE_KEY, JSON.stringify(json))
      } catch { /* ignore save errors */ }
    })

    return () => {
      ws.dispose()
      workspaceRef.current = null
    }
  }, [])

  const updateConfig = useCallback((next: BacktestConfig) => {
    setConfig(next)
    try { localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(next)) } catch { /* */ }
  }, [])

  const handleClear = useCallback(() => {
    if (!workspaceRef.current) return
    workspaceRef.current.clear()
    localStorage.removeItem(LS_WORKSPACE_KEY)
    setErrors([])
  }, [])

  const handleProcess = useCallback(async () => {
    if (!workspaceRef.current) return
    setErrors([])
    setLoading(true)

    try {
      const workspaceJson = Blockly.serialization.workspaces.save(workspaceRef.current)

      const preflightErrors = validateWorkspace(
        workspaceJson as unknown as Record<string, unknown>,
        config,
      )
      if (preflightErrors.length > 0) {
        setErrors(preflightErrors)
        setLoading(false)
        return
      }

      const res = await fetch(`${API_URL}/process-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: workspaceJson, config }),
      })

      if (res.status === 422) {
        const body = await res.json()
        const detail = body.detail || body
        setErrors(detail.errors || ['Validation failed'])
        setLoading(false)
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.detail
        if (detail?.errors) {
          setErrors(detail.errors)
        } else {
          setErrors([`Server error: ${res.status}`])
        }
        setLoading(false)
        return
      }

      const data = await res.json()
      navigate('/backtests', { state: { result: data } })
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to reach backend'])
    } finally {
      setLoading(false)
    }
  }, [config, navigate])

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <section className="page-heading">
        <div>
          <h1>Strategy Builder</h1>
          <p>Build a strategy visually with blocks, then run a backtest</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-primary"
            onClick={handleClear}
            disabled={loading}
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.3)', color: '#94a3b8' }}
          >
            Clear
          </button>
          <button className="btn-primary" onClick={handleProcess} disabled={loading}>
            {loading ? 'Running backtest\u2026' : 'Run Backtest'}
          </button>
        </div>
      </section>

      {errors.length > 0 && (
        <div
          style={{
            color: '#f87171',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {errors.map((e, i) => (
            <div key={i}>{errors.length > 1 ? `\u2022 ${e}` : e}</div>
          ))}
        </div>
      )}

      <div className="block-editor-area">
        <div className="block-workspace" ref={blocklyDivRef} />
        <div className="floating-config">
          <ConfigPanel config={config} onChange={updateConfig} />
        </div>
      </div>
    </div>
  )
}
