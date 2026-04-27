import { Cliente, Projeto, Transacao } from './types'

const KEYS = {
  clientes: 'nitro_clientes',
  projetos: 'nitro_projetos',
  transacoes: 'nitro_transacoes',
}

function get<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function set<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// Clientes
export function getClientes(): Cliente[] { return get<Cliente>(KEYS.clientes) }
export function saveCliente(c: Omit<Cliente, 'id' | 'criadoEm'>): Cliente {
  const novo: Cliente = { ...c, id: uid(), criadoEm: new Date().toISOString() }
  set(KEYS.clientes, [...getClientes(), novo])
  return novo
}
export function updateCliente(id: string, data: Partial<Cliente>): void {
  set(KEYS.clientes, getClientes().map(c => c.id === id ? { ...c, ...data } : c))
}
export function deleteCliente(id: string): void {
  set(KEYS.clientes, getClientes().filter(c => c.id !== id))
}

// Projetos
export function getProjetos(): Projeto[] { return get<Projeto>(KEYS.projetos) }
export function saveProjeto(p: Omit<Projeto, 'id' | 'criadoEm'>): Projeto {
  const novo: Projeto = { ...p, id: uid(), criadoEm: new Date().toISOString() }
  set(KEYS.projetos, [...getProjetos(), novo])
  return novo
}
export function updateProjeto(id: string, data: Partial<Projeto>): void {
  set(KEYS.projetos, getProjetos().map(p => p.id === id ? { ...p, ...data } : p))
}
export function deleteProjeto(id: string): void {
  set(KEYS.projetos, getProjetos().filter(p => p.id !== id))
}

// Transações
export function getTransacoes(): Transacao[] { return get<Transacao>(KEYS.transacoes) }
export function saveTransacao(t: Omit<Transacao, 'id'>): Transacao {
  const nova: Transacao = { ...t, id: uid() }
  set(KEYS.transacoes, [...getTransacoes(), nova])
  return nova
}
export function updateTransacao(id: string, data: Partial<Transacao>): void {
  set(KEYS.transacoes, getTransacoes().map(t => t.id === id ? { ...t, ...data } : t))
}
export function deleteTransacao(id: string): void {
  set(KEYS.transacoes, getTransacoes().filter(t => t.id !== id))
}

// Helpers
export function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function formatData(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}
export { uid }
