import { useStore } from '../lib/store'
import { ROUTE_META, fmtDateTime, fmtDuration, routeOf, serviceMinutes, waitMinutes } from '../lib/utils'
import { Modal, RiskBadge, StatusBadge } from './ui'
import { PatientActions } from './PatientTable'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

export function PatientDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { patients, now } = useStore()
  const p = patients.find(x => x.id === id)
  if (!p) return null
  const svc = serviceMinutes(p, now)

  const steps = [
    { label: 'Chegada', at: p.arrivedAt },
    { label: 'Início do atendimento', at: p.startedAt },
    { label: 'Atendimento finalizado', at: p.finishedAt },
  ]

  return (
    <Modal title="Detalhes do paciente" onClose={onClose} width="max-w-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">{p.name}</p>
          <p className="text-sm text-slate-500">{p.age} anos</p>
        </div>
        <StatusBadge status={p.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Classificação de risco"><RiskBadge risk={p.risk} full /></Field>
        <Field label="Encaminhamento">{ROUTE_META[routeOf(p.risk)].label}</Field>
        <Field label="Tempo de espera">{fmtDuration(waitMinutes(p, now))}{p.status === 'aguardando' && ' (em andamento)'}</Field>
        <Field label="Duração do atendimento">{svc === null ? 'Ainda não iniciado' : fmtDuration(svc)}{p.status === 'atendimento' && ' (em andamento)'}</Field>
        <div className="col-span-2"><Field label="Sintomas / motivo da consulta">{p.complaint}</Field></div>
        <div className="col-span-2"><Field label="Observações">{p.notes ?? <span className="text-slate-400">Sem observações</span>}</Field></div>
      </dl>

      <ol className="mt-6 space-y-3 border-l-2 border-slate-100 pl-4">
        {steps.map(s => (
          <li key={s.label} className="relative">
            <span className={`absolute -left-[22px] top-1 size-2.5 rounded-full ring-4 ring-white ${s.at ? 'bg-brand-600' : 'bg-slate-200'}`} />
            <p className="text-sm font-medium text-slate-800">{s.label}</p>
            <p className="text-xs text-slate-500">{s.at ? fmtDateTime(s.at) : 'Pendente'}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="max-w-[55%] text-xs text-slate-400">Classificação demonstrativa. Não substitui avaliação de profissional habilitado.</p>
        <PatientActions p={p} />
      </div>
    </Modal>
  )
}
