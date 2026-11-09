import { Activity, ArrowRight, CheckCircle2, ClipboardList, Clock, HeartPulse, Siren, Users, Zap, type LucideIcon } from 'lucide-react'
import { useStore } from '../lib/store'
import type { Patient, View } from '../lib/types'
import { RISKS, RISK_META, avgWait, fmtDuration, routeOf, sortQueue, waitMinutes } from '../lib/utils'
import { Card, SectionTitle, btnGhost } from '../components/ui'
import { PatientTable } from '../components/PatientTable'

function Kpi({ icon: Icon, label, value, sub, tone = 'text-brand-600 bg-brand-50' }: { icon: LucideIcon; label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <Card className="anim-fade p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${tone}`}><Icon className="size-4" /></span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Card>
  )
}

function Bar({ label, count, total, color, dot }: { label: string; count: number; total: number; color?: string; dot?: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-slate-700">{dot && <span className={`size-2.5 rounded-full ${dot}`} />}{label}</span>
        <span className="tabular-nums text-slate-500"><span className="font-semibold text-slate-900">{count}</span> · {pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${color ?? 'bg-brand-600'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Dashboard({ go, onDetail }: { go: (v: View) => void; onDetail: (p: Patient) => void }) {
  const { patients, now } = useStore()
  const total = patients.length
  const waiting = patients.filter(p => p.status === 'aguardando')
  const inService = patients.filter(p => p.status === 'atendimento')
  const done = patients.filter(p => p.status === 'atendido')
  const fast = patients.filter(p => routeOf(p.risk) === 'fast-track')
  const prio = patients.filter(p => routeOf(p.risk) === 'prioritario')

  const avgAll = avgWait(patients, now)
  const avgWaiting = avgWait(waiting, now)
  const avgStarted = avgWait(patients.filter(p => p.startedAt), now)
  const longest = waiting.reduce<Patient | null>((m, p) => (!m || waitMinutes(p, now) > waitMinutes(m, now) ? p : m), null)

  const queue = sortQueue(patients).filter(p => p.status !== 'atendido')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Users} label="Pacientes registrados" value={total} sub="Total no sistema" />
        <Kpi icon={Clock} label="Aguardando atendimento" value={waiting.length} sub={avgWaiting === null ? 'Fila vazia' : `Média atual: ${fmtDuration(avgWaiting)}`} tone="text-amber-600 bg-amber-50" />
        <Kpi icon={Activity} label="Em atendimento" value={inService.length} sub="Neste momento" />
        <Kpi icon={CheckCircle2} label="Atendidos" value={done.length} sub="Atendimentos finalizados" tone="text-emerald-600 bg-emerald-50" />
        <Kpi icon={Zap} label="Fast Track" value={fast.length} sub="Classificação azul e verde" tone="text-sky-600 bg-sky-50" />
        <Kpi icon={Siren} label="Fluxo prioritário" value={prio.length} sub="Amarelo, laranja e vermelho" tone="text-red-600 bg-red-50" />
        <Card className="anim-fade col-span-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Tempo médio de espera (estimado)</p>
            <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600"><HeartPulse className="size-4" /></span>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{avgAll === null ? '-' : fmtDuration(avgAll)}</p>
            <div className="text-xs text-slate-500">
              <p>Até o início do atendimento: <span className="font-medium text-slate-700">{avgStarted === null ? '-' : fmtDuration(avgStarted)}</span></p>
              <p>Maior espera na fila: <span className="font-medium text-slate-700">{longest ? `${fmtDuration(waitMinutes(longest, now))} (${longest.name.split(' ')[0]})` : '-'}</span></p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Fila de atendimento"
            hint="Pacientes ativos, ordenados por gravidade e horário de chegada."
            right={<button className={btnGhost} onClick={() => go('fila')}>Fila completa <ArrowRight className="size-4" /></button>}
          />
          <PatientTable rows={queue.slice(0, 8)} onDetail={onDetail} empty="Nenhum paciente ativo na fila." />
          {queue.length > 8 && (
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Mostrando 8 de {queue.length} pacientes ativos.</p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle title="Distribuição por classificação" />
            <div className="space-y-4 p-5">
              {RISKS.map(r => (
                <Bar key={r} label={`${RISK_META[r].label} · ${RISK_META[r].desc}`} dot={RISK_META[r].dot} color={RISK_META[r].bar} count={patients.filter(p => p.risk === r).length} total={total} />
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Distribuição por encaminhamento" />
            <div className="space-y-4 p-5">
              <Bar label="Fast Track" count={fast.length} total={total} color="bg-sky-500" />
              <Bar label="Fluxo prioritário" count={prio.length} total={total} color="bg-slate-800" />
            </div>
          </Card>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ClipboardList className="size-3.5" />
        Indicadores demonstrativos, calculados a partir dos dados fictícios e dos registros feitos neste navegador.
      </p>
    </div>
  )
}
