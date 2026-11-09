import type { Patient, Risk, Route, Status } from './types'

export const RISK_META: Record<
  Risk,
  { label: string; desc: string; order: number; dot: string; badge: string; bar: string; hex: string }
> = {
  vermelho: { label: 'Vermelho', desc: 'Emergência', order: 0, dot: 'bg-red-600', badge: 'bg-red-50 text-red-700 ring-red-200', bar: 'bg-red-600', hex: '#dc2626' },
  laranja: { label: 'Laranja', desc: 'Muito urgente', order: 1, dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 ring-orange-200', bar: 'bg-orange-500', hex: '#f97316' },
  amarelo: { label: 'Amarelo', desc: 'Urgente', order: 2, dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-800 ring-yellow-300', bar: 'bg-yellow-400', hex: '#facc15' },
  verde: { label: 'Verde', desc: 'Pouco urgente', order: 3, dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 ring-green-200', bar: 'bg-green-500', hex: '#22c55e' },
  azul: { label: 'Azul', desc: 'Não urgente', order: 4, dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 ring-blue-200', bar: 'bg-blue-500', hex: '#3b82f6' },
}
export const RISKS: Risk[] = ['vermelho', 'laranja', 'amarelo', 'verde', 'azul']

export const STATUS_META: Record<Status, { label: string; badge: string }> = {
  aguardando: { label: 'Aguardando atendimento', badge: 'bg-slate-100 text-slate-700 ring-slate-200' },
  atendimento: { label: 'Em atendimento', badge: 'bg-brand-50 text-brand-700 ring-brand-100' },
  atendido: { label: 'Atendido', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
}

export const ROUTE_META: Record<Route, { label: string; short: string }> = {
  'fast-track': { label: 'Fast Track (via rápida)', short: 'Fast Track' },
  prioritario: { label: 'Fluxo prioritário de avaliação', short: 'Prioritário' },
}

export const routeOf = (risk: Risk): Route =>
  risk === 'azul' || risk === 'verde' ? 'fast-track' : 'prioritario'

export const isPriority = (p: Patient) => routeOf(p.risk) === 'prioritario'

const ms = (iso: string) => new Date(iso).getTime()

/** Espera em minutos: até o início do atendimento, ou até agora para quem ainda aguarda. */
export function waitMinutes(p: Patient, now: number): number {
  const end = p.startedAt ? ms(p.startedAt) : now
  return Math.max(0, Math.round((end - ms(p.arrivedAt)) / 60000))
}

/** Duração do atendimento em minutos (início até fim, ou até agora se em curso). */
export function serviceMinutes(p: Patient, now: number): number | null {
  if (!p.startedAt) return null
  const end = p.finishedAt ? ms(p.finishedAt) : now
  return Math.max(0, Math.round((end - ms(p.startedAt)) / 60000))
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${String(m).padStart(2, '0')}min` : `${h}h`
}

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')

const STATUS_ORDER: Record<Status, number> = { atendimento: 0, aguardando: 1, atendido: 2 }

/** Ordem da fila: em atendimento, depois aguardando por gravidade e chegada, por fim atendidos. */
export function sortQueue(list: Patient[]): Patient[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (a.status === 'aguardando' && a.risk !== b.risk) return RISK_META[a.risk].order - RISK_META[b.risk].order
    if (a.status === 'atendido') return ms(b.finishedAt ?? b.arrivedAt) - ms(a.finishedAt ?? a.arrivedAt)
    return ms(a.arrivedAt) - ms(b.arrivedAt)
  })
}

export function avgWait(list: Patient[], now: number): number | null {
  if (!list.length) return null
  return Math.round(list.reduce((s, p) => s + waitMinutes(p, now), 0) / list.length)
}
