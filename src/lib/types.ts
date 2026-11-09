export type Risk = 'azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho'
export type Status = 'aguardando' | 'atendimento' | 'atendido'
export type Route = 'fast-track' | 'prioritario'

export interface Patient {
  id: string
  name: string
  age: number
  arrivedAt: string
  risk: Risk
  complaint: string
  notes?: string
  status: Status
  startedAt?: string
  finishedAt?: string
}

export type View = 'dashboard' | 'triagem' | 'fila' | 'historico'
