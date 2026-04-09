import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  initializing: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USER_STORAGE_KEY = 'fc_user'
const TOKEN_STORAGE_KEY = 'fc_token'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type AuthResponse = {
  access_token: string
  token_type: string
  user: User
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    void restoreSession()
  }, [])

  async function restoreSession() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setInitializing(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Session expired')
      }

      const currentUser = (await response.json()) as User
      persist(currentUser, token)
    } catch {
      persist(null, null)
    } finally {
      setInitializing(false)
    }
  }

  function persist(u: User | null, token: string | null) {
    setUser(u)
    try {
      if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(USER_STORAGE_KEY)

      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
      else localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  async function parseError(response: Response, fallback: string) {
    try {
      const data = (await response.json()) as { detail?: string }
      return data.detail || fallback
    } catch {
      return fallback
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to sign in'))
    }

    const data = (await response.json()) as AuthResponse
    persist(data.user, data.access_token)
    return data.user
  }

  async function register(name: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      throw new Error(await parseError(response, 'Failed to create account'))
    }

    const data = (await response.json()) as AuthResponse
    persist(data.user, data.access_token)
    return data.user
  }

  function logout() {
    persist(null, null)
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
