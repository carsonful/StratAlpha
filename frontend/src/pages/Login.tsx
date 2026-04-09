import { useState } from 'react'
import { useAuth } from '../context/Auth'

export default function Login({ onSwitch }: { onSwitch?: () => void }) {
	const { login } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await login(email, password)
			// on success AuthProvider persists user and AuthGate will render the app
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to sign in')
		} finally {
			setLoading(false)
		}
	}

		return (
			<div className="auth-page-root">
				<div className="auth-hero">
					<div className="hero-brand">FightClub</div>
					<p className="hero-sub">Realistic backtests with volatility & volume scaled execution models.</p>
				</div>

				<div className="auth-card">
					<h2>Welcome back</h2>
					<p className="muted">Sign in to access your backtests and saved strategies.</p>

					<form onSubmit={handleSubmit} className="auth-form">
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
								{loading ? 'Signing in…' : 'Sign in'}
							</button>
						</div>
					</form>

					<div className="auth-footer">
						<span>Don't have an account?</span>
						<button className="link-btn" onClick={onSwitch}>Create account</button>
					</div>
				</div>
			</div>
		)
}
