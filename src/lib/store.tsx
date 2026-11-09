import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Patient, Risk, Status } from './types'
import { buildSeed } from './seed'

const KEY = 'hospital-flow:patients:v1'

function load(): Patient[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data)) return data as Patient[]
    }
  } catch {
    /* ignora */
  }
  return buildSeed()
}

export interface NewPatient {
  name: string
  age: number
  risk: Risk
  complaint: string
  notes?: string
}

interface Ctx {
  patients: Patient[]
  now: number
  add: (p: NewPatient) => Patient
  setStatus: (id: string, status: Status) => void
  reset: () => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(load)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(patients))
    } catch {
      /* ignora */
    }
  }, [patients])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  const add = useCallback((np: NewPatient) => {
    const p: Patient = {
      id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: np.name.trim().replace(/\s+/g, ' '),
      age: np.age,
      risk: np.risk,
      complaint: np.complaint.trim(),
      notes: np.notes?.trim() || undefined,
      arrivedAt: new Date().toISOString(),
      status: 'aguardando',
    }
    setPatients(prev => [p, ...prev])
    setNow(Date.now())
    return p
  }, [])

  const setStatus = useCallback((id: string, status: Status) => {
    const t = new Date().toISOString()
    setPatients(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        if (status === 'aguardando') return { ...p, status, startedAt: undefined, finishedAt: undefined }
        if (status === 'atendimento') return { ...p, status, startedAt: p.startedAt ?? t, finishedAt: undefined }
        return { ...p, status, startedAt: p.startedAt ?? t, finishedAt: t }
      }),
    )
    setNow(Date.now())
  }, [])

  const reset = useCallback(() => {
    setPatients(buildSeed())
    setNow(Date.now())
  }, [])

  const value = useMemo(() => ({ patients, now, add, setStatus, reset }), [patients, now, add, setStatus, reset])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider ausente')
  return c
}
