export interface Cliente {
  id: string
  nome: string
  empresa: string
  email: string
  telefone: string
  status: 'ativo' | 'inativo' | 'prospecto'
  criadoEm: string
}

export interface Projeto {
  id: string
  nome: string
  clienteId: string
  clienteNome: string
  status: 'nao_iniciado' | 'em_andamento' | 'em_revisao' | 'concluido' | 'pausado'
  prazo: string
  valor: number
  descricao: string
  criadoEm: string
}

export interface Transacao {
  id: string
  tipo: 'entrada' | 'saida'
  descricao: string
  categoria: string
  valor: number
  data: string
  clienteId?: string
  projetoId?: string
}
