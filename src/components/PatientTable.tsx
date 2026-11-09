import { Eye, Play, CheckCheck, Undo2 } from 'lucide-react'
import type { Patient } from '../lib/types'
import { RISK_META, fmtDuration, fmtTime, isPriority, routeOf, serviceMinutes, waitMinutes } from '../lib/utils'
import { RiskBadge, RouteBadge, StatusBadge, useToast } from './ui'
import { useStore } from '../lib/store'

interface Props {
  rows: Patient[]
  onDetail: (p: Patient) => void
  historyMode?: boolean
  empty?: string
}

export function PatientActions({ p, onDetail }: { p: Patient; onDetail?: (p: Patient) => void }) {
  const { setStatus } = useStore()
  const toast = useToast()
  const small = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97]'
  return (
    <div className="flex items-center justify-end gap-1.5">
      {p.status === 'aguardando' && (
        <button
          className={`${small} bg-brand-600 text-white hover:bg-brand-700`}
          onClick={() => {
            setStatus(p.id, 'atendimento')
            toast(`Atendimento iniciado: ${p.name}`)
          }}
        >
          <Play className="size-3.5" /> Iniciar
        </button>
      )}
      {p.status === 'atendimento' && (
        <>
          <button
            className={`${small} bg-emerald-600 text-white hover:bg-emerald-700`}
            onClick={() => {
              setStatus(p.id, 'atendido')
              toast(`Atendimento finalizado: ${p.name}`)
            }}
          >
            <CheckCheck className="size-3.5" /> Finalizar
          </button>
          <button
            title="Voltar para a fila"
            aria-label="Voltar para a fila"
            className={`${small} border border-slate-200 text-slate-600 hover:bg-slate-50`}
            onClick={() => {
              setStatus(p.id, 'aguardando')
              toast(`${p.name} voltou para a fila`)
            }}
          >
            <Undo2 className="size-3.5" />
          </button>
        </>
      )}
      {p.status === 'atendido' && (
        <button
          title="Reabrir atendimento"
          className={`${small} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={() => {
            setStatus(p.id, 'atendimento')
            toast(`Atendimento reaberto: ${p.name}`)
          }}
        >
          <Undo2 className="size-3.5" /> Reabrir
        </button>
      )}
      {onDetail && (
        <button
          title="Ver detalhes"
          aria-label={`Ver detalhes de ${p.name}`}
          className={`${small} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={() => onDetail(p)}
        >
          <Eye className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function PatientTable({ rows, onDetail, historyMode, empty }: Props) {
  const { now } = useStore()

  if (!rows.length) {
    return <div className="px-5 py-14 text-center text-sm text-slate-500">{empty ?? 'Nenhum paciente encontrado.'}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 font-medium">Paciente</th>
            <th className="px-3 py-3 font-medium">Idade</th>
            <th className="px-3 py-3 font-medium">Chegada</th>
            <th className="px-3 py-3 font-medium">Classificação</th>
            <th className="px-3 py-3 font-medium">Encaminhamento</th>
            <th className="px-3 py-3 font-medium">{historyMode ? 'Espera / Duração' : 'Espera'}</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => {
            const priority = isPriority(p) && p.status !== 'atendido'
            const w = waitMinutes(p, now)
            const svc = serviceMinutes(p, now)
            const longWait = p.status === 'aguardando' && w >= 45
            return (
              <tr key={p.id} className={`anim-fade border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80 ${priority ? 'bg-slate-50/50' : ''}`}>
                <td className="relative px-5 py-3.5">
                  <span className={`absolute inset-y-0 left-0 w-1 ${p.status === 'atendido' ? 'bg-transparent' : RISK_META[p.risk].bar}`} />
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="max-w-[260px] truncate text-xs text-slate-500">{p.complaint}</div>
                </td>
                <td className="px-3 py-3.5 text-slate-600">{p.age} anos</td>
                <td className="px-3 py-3.5 tabular-nums text-slate-600">{fmtTime(p.arrivedAt)}</td>
                <td className="px-3 py-3.5">
                  <span className={p.risk === 'vermelho' && p.status === 'aguardando' ? 'pulse-red inline-block rounded-full' : ''}>
                    <RiskBadge risk={p.risk} />
                  </span>
                </td>
                <td className="px-3 py-3.5"><RouteBadge route={routeOf(p.risk)} /></td>
                <td className="px-3 py-3.5 tabular-nums">
                  <span className={longWait ? 'font-semibold text-red-600' : 'text-slate-700'}>{fmtDuration(w)}</span>
                  {historyMode && svc !== null && <span className="text-xs text-slate-400"> / {fmtDuration(svc)}</span>}
                </td>
                <td className="px-3 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3.5"><PatientActions p={p} onDetail={onDetail} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
