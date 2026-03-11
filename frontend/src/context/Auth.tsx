import { createContext, useContext, useState } from 'react'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'fc_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Do not auto-restore user from localStorage — require explicit sign-in click
  // to enter the app. We still persist on login/register but we won't read it
  // automatically on mount so a page reload always shows the sign-in screen.
  const [user, setUser] = useState<User | null>(null)

  function persist(u: User | null) {
    setUser(u)
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  async function login(email: string, _password: string) {
    // Mock login — in a real app call backend API
    const u: User = { id: String(Date.now()), name: email.split('@')[0], email }
    persist(u)
    return u
  }

  async function register(name: string, email: string, _password: string) {
    // Mock register — in a real app call backend API
    const u: User = { id: String(Date.now()), name, email }
    persist(u)
    return u
  }

  function logout() {
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
