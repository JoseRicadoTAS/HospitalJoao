import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import type { Risk, Route, Status } from '../lib/types'
import { RISK_META, ROUTE_META, STATUS_META } from '../lib/utils'

export function RiskBadge({ risk, full }: { risk: Risk; full?: boolean }) {
  const m = RISK_META[risk]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.badge}`}>
      <span className={`size-2 rounded-full ${m.dot}`} />
      {m.label}
      {full && <span className="font-normal opacity-75">· {m.desc}</span>}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${m.badge}`}>
      {status === 'atendimento' && <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-brand-600" />}
      {m.label}
    </span>
  )
}

export function RouteBadge({ route }: { route: Route }) {
  const priority = route === 'prioritario'
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap ${
        priority ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {ROUTE_META[route].short}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function SectionTitle({ title, hint, right }: { title: string; hint?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {right}
    </div>
  )
}

export function Modal({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; width?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={`anim-pop relative max-h-[90vh] w-full overflow-auto rounded-2xl bg-white shadow-2xl ${width}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]'

/* Notificações simples */
const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; k: number } | null>(null)
  const notify = useCallback((text: string) => setMsg({ text, k: Date.now() }), [])
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 3200)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {msg && (
        <div key={msg.k} role="status" className="anim-fade fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircle2 className="size-4 text-emerald-400" />
          {msg.text}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
