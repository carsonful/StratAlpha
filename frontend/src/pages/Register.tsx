import { useState } from 'react'
import { useAuth } from '../context/Auth'

export default function Register({ onSwitch }: { onSwitch?: () => void }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password)
      // on success AuthProvider persists user and AuthGate will render the app
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p>Sign up to save backtests and access your dashboard.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="form-label">Full name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Password</label>
        <input
          className="form-control"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="form-error">{error}</div>}

        <div className="auth-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>
        <button className="link-btn" onClick={onSwitch}>Sign in</button>
      </div>
    </div>
  )
}
