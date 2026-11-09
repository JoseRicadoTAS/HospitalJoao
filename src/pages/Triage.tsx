import { useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowRight, Info, UserPlus } from 'lucide-react'
import { useStore } from '../lib/store'
import type { Patient, Risk, View } from '../lib/types'
import { RISKS, RISK_META, ROUTE_META, fmtTime, normalize, routeOf } from '../lib/utils'
import { Card, Modal, RiskBadge, RouteBadge, SectionTitle, btnGhost, btnPrimary, useToast } from '../components/ui'

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Triage({ go, onDetail }: { go: (v: View) => void; onDetail: (p: Patient) => void }) {
  const { patients, add } = useStore()
  const toast = useToast()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [risk, setRisk] = useState<Risk | null>(null)
  const [complaint, setComplaint] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dup, setDup] = useState<Patient | null>(null)
  const [created, setCreated] = useState<Patient | null>(null)
  const [arrival, setArrival] = useState(() => new Date().toISOString())

  const validate = () => {
    const e: Record<string, string> = {}
    if (name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = 'Informe o nome completo.'
    const a = Number(age)
    if (!age || !Number.isInteger(a) || a < 0 || a > 120) e.age = 'Informe uma idade entre 0 e 120.'
    if (!risk) e.risk = 'Selecione a classificação de risco.'
    if (complaint.trim().length < 3) e.complaint = 'Descreva os sintomas ou o motivo da consulta.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const register = () => {
    const p = add({ name, age: Number(age), risk: risk as Risk, complaint, notes })
    setCreated(p)
    setDup(null)
    toast(`Paciente registrado: ${p.name}`)
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    const found = patients.find(p => p.status !== 'atendido' && normalize(p.name) === normalize(name) && p.age === Number(age))
    if (found) setDup(found)
    else register()
  }

  const newOne = () => {
    setName(''); setAge(''); setRisk(null); setComplaint(''); setNotes(''); setErrors({}); setCreated(null)
    setArrival(new Date().toISOString())
  }

  if (created) {
    const route = routeOf(created.risk)
    return (
      <Card className="anim-fade mx-auto max-w-2xl">
        <SectionTitle title="Paciente registrado" hint="O paciente já aparece na fila de atendimento." />
        <div className="space-y-5 p-6">
          <div>
            <p className="text-lg font-semibold text-slate-900">{created.name}</p>
            <p className="text-sm text-slate-500">{created.age} anos · chegada às {fmtTime(created.arrivedAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RiskBadge risk={created.risk} full />
            <ArrowRight className="size-4 text-slate-300" />
            <RouteBadge route={route} />
          </div>
          <div className={`rounded-lg border px-4 py-3 text-sm ${route === 'prioritario' ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
            <p className="font-medium">Encaminhamento demonstrativo: {ROUTE_META[route].label}</p>
            <p className="mt-1 text-xs opacity-80">
              {route === 'prioritario'
                ? 'Paciente posicionado no topo da fila de espera, de acordo com a classificação registrada.'
                : 'Paciente direcionado à via rápida, de acordo com a classificação registrada.'}{' '}
              Não substitui a avaliação de um profissional de saúde.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={btnPrimary} onClick={() => go('fila')}>Ver na fila</button>
            <button className={btnGhost} onClick={() => onDetail(created)}>Ver detalhes</button>
            <button className={btnGhost} onClick={newOne}>Registrar outro paciente</button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <SectionTitle title="Nova triagem" hint="Registro do paciente e classificação de risco demonstrativa." />
        <form onSubmit={submit} className="space-y-5 p-6" noValidate>
          <div className="grid gap-5 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">Nome completo</label>
              <input id="name" className={input} value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Maria Fernanda Oliveira" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="age" className="mb-1.5 block text-sm font-medium text-slate-700">Idade</label>
              <input id="age" type="number" min={0} max={120} className={input} value={age} onChange={e => setAge(e.target.value)} />
              {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="arrival" className="mb-1.5 block text-sm font-medium text-slate-700">Chegada</label>
              <input id="arrival" className={`${input} bg-slate-50 text-slate-500`} value={fmtTime(arrival)} readOnly />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Classificação de risco (demonstrativa)</legend>
            <div className="grid gap-2 sm:grid-cols-5">
              {RISKS.map(r => {
                const m = RISK_META[r]
                const active = risk === r
                return (
                  <button
                    type="button"
                    key={r}
                    aria-pressed={active}
                    onClick={() => setRisk(r)}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition active:scale-[0.98] ${active ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <span className={`size-3 rounded-full ${m.dot}`} />
                    <span className="text-sm font-semibold text-slate-900">{m.label}</span>
                    <span className="text-xs text-slate-500">{m.desc}</span>
                  </button>
                )
              })}
            </div>
            {errors.risk && <p className="mt-1 text-xs text-red-600">{errors.risk}</p>}
          </fieldset>

          <div>
            <label htmlFor="complaint" className="mb-1.5 block text-sm font-medium text-slate-700">Sintomas ou motivo da consulta</label>
            <textarea id="complaint" rows={3} className={input} value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Descreva de forma breve" />
            {errors.complaint && <p className="mt-1 text-xs text-red-600">{errors.complaint}</p>}
          </div>
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-700">Observações <span className="font-normal text-slate-400">(opcional)</span></label>
            <textarea id="notes" rows={2} className={input} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <button type="submit" className={btnPrimary}><UserPlus className="size-4" /> Registrar paciente</button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <SectionTitle title="Encaminhamento previsto" />
          <div className="space-y-3 p-5 text-sm">
            {risk ? (
              <div className="anim-fade space-y-3">
                <RiskBadge risk={risk} full />
                <RouteBadge route={routeOf(risk)} />
                <p className="text-slate-600">{ROUTE_META[routeOf(risk)].label}</p>
              </div>
            ) : (
              <p className="text-slate-500">Selecione uma classificação para ver o encaminhamento demonstrativo.</p>
            )}
            <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <li><span className="font-medium text-slate-700">Azul e Verde:</span> Fast Track (via rápida)</li>
              <li><span className="font-medium text-slate-700">Amarelo, Laranja e Vermelho:</span> fluxo prioritário de avaliação</li>
            </ul>
          </div>
        </Card>
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>Esta classificação é exclusivamente demonstrativa. A classificação de risco real depende de profissional habilitado e do protocolo institucional. O sistema não toma decisões clínicas.</p>
        </div>
      </div>

      {dup && (
        <Modal title="Possível registro duplicado" onClose={() => setDup(null)}>
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <p className="text-sm text-slate-600">
              Já existe um paciente ativo chamado <span className="font-medium text-slate-900">{dup.name}</span> ({dup.age} anos), registrado às {fmtTime(dup.arrivedAt)}. Deseja registrar novamente mesmo assim?
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className={btnGhost} onClick={() => setDup(null)}>Cancelar</button>
            <button className={btnPrimary} onClick={register}>Registrar mesmo assim</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
