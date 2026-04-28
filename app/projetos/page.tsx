'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, FolderOpen, Search, CalendarDays } from 'lucide-react'
import { getProjetos, saveProjeto, updateProjeto, deleteProjeto, getClientes, formatMoeda, formatData } from '@/lib/store'
import { Projeto, Cliente } from '@/lib/types'

const STATUS_OPT = [
  { value: 'nao_iniciado', label: 'Não iniciado', color: '#44444E' },
  { value: 'em_andamento', label: 'Em andamento', color: '#F5C518' },
  { value: 'em_revisao',   label: 'Em revisão',   color: '#FB923C' },
  { value: 'concluido',    label: 'Concluído',    color: '#22C55E' },
  { value: 'pausado',      label: 'Pausado',      color: '#EF4444' },
]

const EMPTY_FORM = {
  nome: '', clienteId: '', clienteNome: '', status: 'nao_iniciado' as Projeto['status'],
  prazo: '', valor: '', descricao: ''
}

export default function ProjetosPage() {
  const [projetos,   setProjetos]   = useState<Projeto[]>([])
  const [clientes,   setClientes]   = useState<Cliente[]>([])
  const [filtroSt,   setFiltroSt]   = useState('todos')
  const [busca,      setBusca]      = useState('')
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const reload = () => { setProjetos(getProjetos()); setClientes(getClientes()) }
  useEffect(() => { reload() }, [])

  const filtrados = projetos.filter(p => {
    const okSt    = filtroSt === 'todos' || p.status === filtroSt
    const okBusca = [p.nome, p.clienteNome].join(' ').toLowerCase().includes(busca.toLowerCase())
    return okSt && okBusca
  })

  function abrirNovo() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function abrirEditar(p: Projeto) {
    setForm({ nome: p.nome, clienteId: p.clienteId, clienteNome: p.clienteNome,
      status: p.status, prazo: p.prazo, valor: String(p.valor), descricao: p.descricao })
    setEditId(p.id); setModal(true)
  }
  function salvar() {
    if (!form.nome.trim()) return
    const data = { ...form, valor: parseFloat(form.valor) || 0 }
    if (editId) updateProjeto(editId, data); else saveProjeto(data)
    reload(); setModal(false)
  }
  function handleCliente(id: string) {
    const c = clientes.find(c => c.id === id)
    setForm(f => ({ ...f, clienteId: id, clienteNome: c?.nome || '' }))
  }

  return (
    <div className="min-h-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 anim-up">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text3)' }}>
              Gestão
            </p>
            <h1 className="font-display text-[28px] lg:text-[36px] leading-none tracking-[0.04em]">PROJETOS</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>
              {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <button onClick={abrirNovo}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 self-start sm:self-auto shrink-0"
            style={{ background: 'var(--accent)', color: '#000' }}>
            <Plus size={16} strokeWidth={2.5} /> Novo Projeto
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 anim-up d-1">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text3)' }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar projeto ou cliente…"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[{ value: 'todos', label: 'Todos', color: 'var(--accent)' }, ...STATUS_OPT].map(s => (
              <button key={s.value} onClick={() => setFiltroSt(s.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: filtroSt === s.value ? s.color + '22' : 'var(--surface)',
                  color:      filtroSt === s.value ? s.color : 'var(--text2)',
                  border:     `1px solid ${filtroSt === s.value ? s.color + '44' : 'var(--border)'}`,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtrados.length === 0 ? <Vazio /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 anim-up d-2">
            {filtrados.map(p => {
              const st = STATUS_OPT.find(s => s.value === p.status)
              return (
                <div key={p.id} className="rounded-2xl flex flex-col transition-all hover:brightness-105"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  {/* Card top */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: st?.color + '18', color: st?.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st?.color, boxShadow: `0 0 5px ${st?.color}99` }} />
                        {st?.label}
                      </span>
                    </div>
                    <p className="font-semibold text-sm leading-snug mb-1">{p.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{p.clienteNome || 'Sem cliente'}</p>
                    {p.descricao && (
                      <p className="text-xs mt-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text3)' }}>
                        {p.descricao}
                      </p>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="grid grid-cols-2 gap-px" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="px-4 py-3" style={{ background: 'var(--surface2)' }}>
                      <p className="text-[9px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: 'var(--text3)' }}>Valor</p>
                      <p className="text-sm font-semibold font-mono">{formatMoeda(p.valor)}</p>
                    </div>
                    <div className="px-4 py-3" style={{ background: 'var(--surface2)' }}>
                      <p className="text-[9px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: 'var(--text3)' }}>Prazo</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {p.prazo
                          ? <><CalendarDays size={11} style={{ color: 'var(--text3)' }} />{formatData(p.prazo)}</>
                          : <span style={{ color: 'var(--text3)' }}>—</span>}
                      </p>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex gap-px" style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => abrirEditar(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all hover:brightness-125 rounded-bl-2xl"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => setConfirmDel(p.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all hover:brightness-125 rounded-br-2xl"
                      style={{ background: '#EF444410', color: 'var(--danger)' }}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal form */}
      {modal && (
        <Modal title={editId ? 'Editar Projeto' : 'Novo Projeto'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Nome do projeto *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} placeholder="Ex: Site Institucional" />
            <div>
              <label className="field-label block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                Cliente
              </label>
              <select value={form.clienteId} onChange={e => handleCliente(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                <option value="">Selecionar cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPT.map(s => (
                  <button key={s.value} onClick={() => setForm(f => ({ ...f, status: s.value as Projeto['status'] }))}
                    className="py-2 rounded-xl text-[10px] font-semibold transition-all"
                    style={{
                      background: form.status === s.value ? s.color + '22' : 'var(--surface2)',
                      color:      form.status === s.value ? s.color : 'var(--text2)',
                      border:     `1px solid ${form.status === s.value ? s.color + '44' : 'var(--border)'}`,
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor (R$)" value={form.valor} onChange={v => setForm(f => ({ ...f, valor: v }))} placeholder="0,00" type="number" />
              <Field label="Prazo" value={form.prazo} onChange={v => setForm(f => ({ ...f, prazo: v }))} type="date" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                Descrição
              </label>
              <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva o projeto…" rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all resize-none"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <ModalActions onCancel={() => setModal(false)} onSave={salvar} saveLabel={editId ? 'Salvar' : 'Criar Projeto'} />
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir projeto?" onClose={() => setConfirmDel(null)}>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>Esta ação não pode ser desfeita.</p>
          <ModalActions onCancel={() => setConfirmDel(null)}
            onSave={() => { deleteProjeto(confirmDel); reload(); setConfirmDel(null) }}
            saveLabel="Excluir" danger />
        </Modal>
      )}
    </div>
  )
}

/* ── Shared ── */
function Vazio() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 anim-up">
      <FolderOpen size={44} style={{ color: 'var(--text3)' }} strokeWidth={1.2} />
      <p className="font-semibold" style={{ color: 'var(--text2)' }}>Nenhum projeto encontrado</p>
      <p className="text-sm" style={{ color: 'var(--text3)' }}>Crie seu primeiro projeto acima</p>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 anim-scale my-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
    </div>
  )
}

function ModalActions({ onCancel, onSave, saveLabel, danger }: {
  onCancel: () => void; onSave: () => void; saveLabel: string; danger?: boolean
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
        Cancelar
      </button>
      <button onClick={onSave}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-95"
        style={{ background: danger ? 'var(--danger)' : 'var(--accent)', color: danger ? '#fff' : '#000' }}>
        {saveLabel}
      </button>
    </div>
  )
}
