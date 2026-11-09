import type { Patient, Risk, Status } from './types'

// [nome, idade, risco, status, chegada (min atrás), motivo, observação, espera até início (min), duração do atendimento (min)]
type Row = [string, number, Risk, Status, number, string, string | undefined, number?, number?]

const ROWS: Row[] = [
  ['Marcos Vinícius Tavares', 58, 'vermelho', 'atendimento', 52, 'Dor intensa no peito com sudorese', 'Histórico de hipertensão informado pelo acompanhante', 4],
  ['Helena Duarte Albuquerque', 71, 'laranja', 'aguardando', 38, 'Falta de ar progressiva e cansaço', undefined],
  ['Rafael Nogueira Prado', 34, 'laranja', 'atendimento', 47, 'Queda de moto com dor forte na perna', 'Chegou de ambulância', 9],
  ['Beatriz Souza Lima', 27, 'amarelo', 'aguardando', 31, 'Febre alta persistente há dois dias', undefined],
  ['Antônio Carlos Medeiros', 66, 'amarelo', 'aguardando', 24, 'Tontura e pressão alta', 'Faz uso contínuo de medicação', undefined],
  ['Larissa Fontes Cardoso', 19, 'verde', 'aguardando', 44, 'Dor de garganta e tosse', undefined],
  ['Gustavo Henrique Reis', 42, 'verde', 'aguardando', 18, 'Corte na mão sem sangramento ativo', undefined],
  ['Marina Teixeira Barros', 8, 'verde', 'atendimento', 40, 'Dor de ouvido e febre baixa', 'Acompanhada pela mãe', 22],
  ['José Aparecido Ferraz', 79, 'azul', 'aguardando', 56, 'Renovação de receita e dor lombar antiga', undefined],
  ['Camila Ribeiro Matos', 31, 'azul', 'aguardando', 12, 'Dor de cabeça leve', undefined],
  ['Eduardo Lacerda Pinto', 45, 'amarelo', 'atendido', 150, 'Crise de cólica renal', undefined, 14, 38],
  ['Patrícia Moreira Gomes', 52, 'verde', 'atendido', 130, 'Torção leve no tornozelo', 'Liberada com orientações', 36, 21],
  ['Thiago Almeida Santos', 23, 'azul', 'atendido', 115, 'Conjuntivite', undefined, 41, 12],
  ['Sônia Maria Ventura', 63, 'laranja', 'atendido', 170, 'Dor abdominal intensa', undefined, 6, 55],
]

export function buildSeed(now = Date.now()): Patient[] {
  const iso = (minAgo: number) => new Date(now - minAgo * 60000).toISOString()
  return ROWS.map(([name, age, risk, status, ago, complaint, notes, wait, dur], i) => {
    const p: Patient = { id: `seed-${i + 1}`, name, age, risk, status, complaint, notes, arrivedAt: iso(ago) }
    if (status !== 'aguardando') {
      const w = wait ?? 10
      p.startedAt = iso(ago - w)
      if (status === 'atendido') p.finishedAt = iso(ago - w - (dur ?? 20))
    }
    return p
  })
}
