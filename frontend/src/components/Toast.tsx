import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, X, XCircle } from 'lucide-react'

interface Toast {
  id:    string
  title: string
  body:  string
  type:  'success' | 'error'
}

export interface ToastHistoryItem {
  id:    string
  title: string
  body:  string
  type:  'success' | 'error'
  time:  Date
}

interface ToastCtx {
  show:         (t: Omit<Toast, 'id'>) => void
  history:      ToastHistoryItem[]
  clearHistory: () => void
}

const Ctx = createContext<ToastCtx>({ show: () => {}, history: [], clearHistory: () => {} })

export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts,  setToasts]  = useState<Toast[]>([])
  const [history, setHistory] = useState<ToastHistoryItem[]>([])

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const clearHistory = useCallback(() => setHistory([]), [])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...t, id }])
    setHistory((prev) => [{ ...t, id, time: new Date() }, ...prev].slice(0, 20))
    setTimeout(() => dismiss(id), 4500)
  }, [])

  return (
    <Ctx.Provider value={{ show, history, clearHistory }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">
              {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </span>
            <div className="toast__body">
              <strong className="toast__title">{t.title}</strong>
              <span className="toast__sub">{t.body}</span>
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
