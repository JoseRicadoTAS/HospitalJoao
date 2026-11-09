import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../lib/store'
import type { Patient, Risk, Route, Status } from '../lib/types'
import { RISKS, RISK_META, ROUTE_META, STATUS_META, normalize, sortQueue } from '../lib/utils'
import { Card, SectionTitle } from '../components/ui'
import { PatientTable } from '../components/PatientTable'

const sel = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Queue({ onDetail, historyMode }: { onDetail: (p: Patient) => void; historyMode?: boolean }) {
  const { patients } = useStore()
  const [q, setQ] = useState('')
  const [risk, setRisk] = useState<Risk | ''>('')
  const [route, setRoute] = useState<Route | ''>('')
  const [status, setStatus] = useState<Status | ''>('')

  const base = useMemo(
    () => (historyMode ? patients.filter(p => p.status === 'atendido') : patients),
    [patients, historyMode],
  )

  const rows = useMemo(() => {
    const nq = normalize(q)
    const list = base.filter(
      p =>
        (!nq || normalize(p.name).includes(nq)) &&
        (!risk || p.risk === risk) &&
        (!route || (p.risk === 'azul' || p.risk === 'verde' ? 'fast-track' : 'prioritario') === route) &&
        (!status || p.status === status),
    )
    return sortQueue(list)
  }, [base, q, risk, route, status])

  const filtered = q || risk || route || status

  return (
    <Card>
      <SectionTitle
        title={historyMode ? 'Histórico de pacientes atendidos' : 'Fila de atendimento'}
        hint={
          historyMode
            ? 'Atendimentos finalizados, do mais recente para o mais antigo. Espera / duração em minutos.'
            : 'Em atendimento primeiro; aguardando por gravidade e horário de chegada.'
        }
        right={<span className="text-xs text-slate-500">{rows.length} de {base.length} pacientes</span>}
      />
      <div className="flex flex-wrap gap-3 border-b border-slate-100 px-5 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pesquisar pelo nome do paciente" aria-label="Pesquisar paciente" className={`${sel} w-full pl-9`} />
        </div>
        <select aria-label="Filtrar por classificação" className={sel} value={risk} onChange={e => setRisk(e.target.value as Risk | '')}>
          <option value="">Todas as classificações</option>
          {RISKS.map(r => <option key={r} value={r}>{RISK_META[r].label} - {RISK_META[r].desc}</option>)}
        </select>
        <select aria-label="Filtrar por encaminhamento" className={sel} value={route} onChange={e => setRoute(e.target.value as Route | '')}>
          <option value="">Todos os encaminhamentos</option>
          {(Object.keys(ROUTE_META) as Route[]).map(r => <option key={r} value={r}>{ROUTE_META[r].short}</option>)}
        </select>
        {!historyMode && (
          <select aria-label="Filtrar por status" className={sel} value={status} onChange={e => setStatus(e.target.value as Status | '')}>
            <option value="">Todos os status</option>
            {(Object.keys(STATUS_META) as Status[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
        )}
        {filtered && (
          <button className="text-sm font-medium text-brand-600 hover:underline" onClick={() => { setQ(''); setRisk(''); setRoute(''); setStatus('') }}>
            Limpar filtros
          </button>
        )}
      </div>
      <PatientTable
        rows={rows}
        onDetail={onDetail}
        historyMode={historyMode}
        empty={filtered ? 'Nenhum paciente corresponde aos filtros.' : historyMode ? 'Nenhum atendimento finalizado ainda.' : 'A fila está vazia.'}
      />
    </Card>
  )
}
