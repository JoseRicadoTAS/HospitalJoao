import { useState } from 'react'
import { ClipboardPlus, History, LayoutDashboard, ListChecks, Menu, RotateCcw, type LucideIcon } from 'lucide-react'
import { StoreProvider, useStore } from './lib/store'
import type { Patient, View } from './lib/types'
import { Modal, ToastProvider, btnGhost, btnPrimary, useToast } from './components/ui'
import { PatientDetail } from './components/PatientDetail'
import { Dashboard } from './pages/Dashboard'
import { Triage } from './pages/Triage'
import { Queue } from './pages/Queue'

const NAV: { id: View; label: string; title: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', title: 'Painel de atendimento', icon: LayoutDashboard },
  { id: 'triagem', label: 'Nova triagem', title: 'Nova triagem', icon: ClipboardPlus },
  { id: 'fila', label: 'Fila de atendimento', title: 'Fila de atendimento', icon: ListChecks },
  { id: 'historico', label: 'Histórico de pacientes', title: 'Histórico de pacientes', icon: History },
]

function Shell() {
  const { reset, now } = useStore()
  const toast = useToast()
  const [view, setView] = useState<View>('dashboard')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const go = (v: View) => { setView(v); setOpen(false); window.scrollTo({ top: 0 }) }
  const onDetail = (p: Patient) => setDetailId(p.id)
  const current = NAV.find(n => n.id === view)!

  return (
    <div className="min-h-screen lg:pl-64">
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 text-blue-100 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <svg viewBox="0 0 32 32" className="size-5"><path d="M13 5h6v8h8v6h-8v8h-6v-8H5v-6h8z" fill="#fff" /></svg>
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-white">Hospital Flow</p>
            <p className="text-xs text-blue-200/70">Pronto-socorro</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(n => (
            <button key={n.id} onClick={() => go(n.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${view === n.id ? 'bg-white/12 text-white' : 'text-blue-100/80 hover:bg-white/6 hover:text-white'}`}>
              <n.icon className="size-4.5" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="space-y-3 p-4">
          <button onClick={() => setConfirmReset(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-blue-100 transition hover:bg-white/10">
            <RotateCcw className="size-3.5" /> Restaurar dados de demonstração
          </button>
          <p className="text-[11px] leading-snug text-blue-200/60">Sistema demonstrativo. Dados fictícios, salvos apenas neste navegador.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/85 px-4 py-3.5 backdrop-blur sm:px-8">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{current.title}</h1>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-400">Atualizado em</p>
          <p className="text-sm font-medium tabular-nums text-slate-700">{new Date(now).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {view !== 'triagem' && (
          <button className={btnPrimary} onClick={() => go('triagem')}><ClipboardPlus className="size-4" /> <span className="hidden sm:inline">Nova triagem</span></button>
        )}
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8">
        <div key={view} className="anim-fade">
          {view === 'dashboard' && <Dashboard go={go} onDetail={onDetail} />}
          {view === 'triagem' && <Triage go={go} onDetail={onDetail} />}
          {view === 'fila' && <Queue onDetail={onDetail} />}
          {view === 'historico' && <Queue onDetail={onDetail} historyMode />}
        </div>
      </main>

      {detailId && <PatientDetail id={detailId} onClose={() => setDetailId(null)} />}

      {confirmReset && (
        <Modal title="Restaurar dados de demonstração" onClose={() => setConfirmReset(false)}>
          <p className="text-sm text-slate-600">Todos os registros atuais serão substituídos pelos pacientes fictícios iniciais. Esta ação não pode ser desfeita.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button className={btnGhost} onClick={() => setConfirmReset(false)}>Cancelar</button>
            <button className={btnPrimary} onClick={() => { reset(); setConfirmReset(false); setDetailId(null); toast('Dados de demonstração restaurados') }}>Restaurar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  )
}
