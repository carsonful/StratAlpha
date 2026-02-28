import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Database,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Search,
  Zap,
  ShieldCheck,
  Circle,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import type { NavKey } from './types'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { icon: React.ReactNode; label: string; key: NavKey }[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', key: 'dashboard' },
  { icon: <TrendingUp size={18} />, label: 'Backtests', key: 'backtests' },
  { icon: <Zap size={18} />, label: 'Strategies', key: 'strategies' },
  { icon: <Database size={18} />, label: 'Data', key: 'data' },
  { icon: <BarChart2 size={18} />, label: 'Analytics', key: 'analytics' },
]

const TOOL_ITEMS: { icon: React.ReactNode; label: string; key: NavKey }[] = [
  { icon: <ShieldCheck size={18} />, label: 'Risk Monitor', key: 'risk' },
  { icon: <Settings size={18} />, label: 'Settings', key: 'settings' },
]

// ── Page registry — add new pages here as the app grows ──────────────────────

function PageContent({ activeNav }: { activeNav: NavKey }) {
  switch (activeNav) {
    case 'dashboard':
      return <Dashboard />
    default:
      return (
        <div className="page-placeholder">
          <span>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</span>
          <p>This page is coming soon.</p>
        </div>
      )
  }
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>(
    'checking',
  )

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.status === 'healthy' ? 'connected' : 'disconnected')
      })
      .catch(() => setBackendStatus('disconnected'))
  }, [])

  const statusColor =
    backendStatus === 'connected' ? '#4ade80' : backendStatus === 'checking' ? '#facc15' : '#f87171'

  return (
    <div className="app-root">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">FC</span>
          <span className="logo-text">FightClub</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">General</span>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${activeNav === item.key ? ' nav-item--active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <nav className="sidebar-nav sidebar-nav--tools">
          <span className="nav-section-label">Tools</span>
          {TOOL_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${activeNav === item.key ? ' nav-item--active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item nav-item--danger">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input placeholder="Search strategies, symbols..." />
          </div>
          <div className="topbar-right">
            <div className="status-pill">
              <Circle size={8} fill={statusColor} stroke="none" />
              <span>API {backendStatus}</span>
            </div>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="avatar">TC</div>
          </div>
        </header>

        <div className="page-content">
          <PageContent activeNav={activeNav} />
        </div>
      </main>
    </div>
  )
}
