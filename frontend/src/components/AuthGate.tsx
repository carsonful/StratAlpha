import { useState } from 'react'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { useAuth } from '../context/Auth'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (initializing) {
    return (
      <div className="auth-page-root">
        <div className="auth-card">
          <h2>Loading session</h2>
          <p className="muted">Checking your sign-in status...</p>
        </div>
      </div>
    )
  }

  if (user) return <>{children}</>

  return (
    <div className="auth-page-root">
      {showRegister ? (
        <Register onSwitch={() => setShowRegister(false)} />
      ) : (
        <Login onSwitch={() => setShowRegister(true)} />
      )}
    </div>
  )
}
