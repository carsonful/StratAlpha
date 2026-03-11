import { useState } from 'react'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { useAuth } from '../context/Auth'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

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
