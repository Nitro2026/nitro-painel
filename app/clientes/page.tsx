'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, X, UserCircle2, Users } from 'lucide-react'
import { getClientes, saveCliente, updateCliente, deleteCliente, formatData } from '@/lib/store'
import { Cliente } from '@/lib/types'
import PageHeader from '@/components/PageHeader'

const STATUS_OPT = [
  { value: 'ativo',     label: 'Ativo',      color: '#22C55E' },
  { value: 'inativo',   label: 'Inativo',    color: '#44444E' },
  { value: 'prospecto', label: 'Prospecto',  color: '#F5C518' },
]

const EMPTY: Omit<Cliente, 'id' | 'criadoEm'> = {
  nome: '', empresa: '', email: '', telefone: '', status: 'ativo'
}

export default function ClientesPage() {
  const [clientes,   setClientes]   = useState<Cliente[]>([])
  const [busca,      setBusca]      = useState('')
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const reload = () => setClientes(getClientes())
  useEffect(() => { reload() }, [])

  const filtrados = clientes.filter(c =>
    [c.nome, c.empresa, c.email].join(' ').toLowerCase().includes(busca.toLowerCase())
  )

  function abrirNovo() { setForm(EMPTY); setEditId(null); setModal(true) }
  function abrirEditar(c: Cliente) {
    setForm({ nome: c.nome, empresa: c.empresa, email: c.email, telefone: c.telefone, status: c.status })
    setEditId(c.id); setModal(true)
  }
  function salvar() {
    if (!form.nome.trim()) return
    if (editId) updateCliente(editId, form); else saveCliente(form)
    reload(); setModal(false)
  }

  return (
    <div className="min-h-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-7 lg:py-9">

        <PageHeader
          icon={<Users size={16} style={{ color: 'var(--accent)' }} />}
          title="Clientes"
          subtitle={`${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`}
          action={
            <button onClick={abrirNovo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'var(--accent)', color: '#000' }}>
              <Plus size={15} strokeWidth={2.5} /> Novo Cliente
            </button>
          }
        />

        {/* Busca */}
        <div className="relative mb-5 anim-up d-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text3)' }} />
          <input type="text" placeholder="Buscar por nome, empresa ou email…"
            value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Lista */}
        {filtrados.length === 0 ? <Vazio /> : (
          <>
            {/* Desktop */}
            <div className="hidden md:block rounded-2xl overflow-hidden anim-up d-2"
              style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    {['Nome', 'Empresa', 'Contato', 'Status', 'Desde', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase"
                        style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(c => (
                    <tr key={c.id} className="group transition-all"
                      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ background: 'var(--surface3)', color: 'var(--accent)' }}>
                            {c.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4" style={{ color: 'var(--text2)' }}>{c.empresa || '—'}</td>
                      <td className="px-5 py-4">
                        <p className="text-xs" style={{ color: 'var(--text2)' }}>{c.email || '—'}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{c.telefone || ''}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--text3)' }}>{formatData(c.criadoEm)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconBtn icon={<Pencil size={13} />} onClick={() => abrirEditar(c)} />
                          <IconBtn icon={<Trash2 size={13} />} onClick={() => setConfirmDel(c.id)} danger />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2 anim-up d-2">
              {filtrados.map(c => (
                <div key={c.id} className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'var(--surface3)', color: 'var(--accent)' }}>
                        {c.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{c.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{c.empresa || '—'}</p>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => abrirEditar(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                      style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => setConfirmDel(c.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                      style={{ background: '#EF444414', color: 'var(--danger)' }}>
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal form */}
      {modal && (
        <Modal title={editId ? 'Editar Cliente' : 'Novo Cliente'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Nome *" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} placeholder="Nome completo" />
            <Field label="Empresa" value={form.empresa} onChange={v => setForm(f => ({ ...f, empresa: v }))} placeholder="Nome da empresa" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@…" type="email" />
              <Field label="Telefone" value={form.telefone} onChange={v => setForm(f => ({ ...f, telefone: v }))} placeholder="(11) 9…" />
            </div>
            <div>
              <label className="field-label">Status</label>
              <div className="flex gap-2">
                {STATUS_OPT.map(s => (
                  <button key={s.value} onClick={() => setForm(f => ({ ...f, status: s.value as Cliente['status'] }))}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
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
            <ModalActions onCancel={() => setModal(false)} onSave={salvar} saveLabel={editId ? 'Salvar' : 'Cadastrar'} />
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir cliente?" onClose={() => setConfirmDel(null)}>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>
            Esta ação não pode ser desfeita.
          </p>
          <ModalActions onCancel={() => setConfirmDel(null)}
            onSave={() => { deleteCliente(confirmDel); reload(); setConfirmDel(null) }}
            saveLabel="Excluir" danger />
        </Modal>
      )}
    </div>
  )
}

/* ── Shared ── */

function StatusBadge({ status }: { status: Cliente['status'] }) {
  const s = STATUS_OPT.find(o => o.value === status)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: s?.color + '18', color: s?.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s?.color }} />
      {s?.label}
    </span>
  )
}

function IconBtn({ icon, onClick, danger }: { icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:brightness-125"
      style={{ background: danger ? '#EF444418' : 'var(--surface3)', color: danger ? 'var(--danger)' : 'var(--text2)' }}>
      {icon}
    </button>
  )
}

function Vazio() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 anim-up">
      <UserCircle2 size={44} style={{ color: 'var(--text3)' }} strokeWidth={1.2} />
      <p className="font-semibold" style={{ color: 'var(--text2)' }}>Nenhum cliente encontrado</p>
      <p className="text-sm" style={{ color: 'var(--text3)' }}>Cadastre seu primeiro cliente acima</p>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 anim-scale"
        style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:brightness-125"
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
      <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
        style={{ color: 'var(--text2)' }}>{label}</label>
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
        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
        style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
        Cancelar
      </button>
      <button onClick={onSave}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        style={{ background: danger ? 'var(--danger)' : 'var(--accent)', color: danger ? '#fff' : '#000' }}>
        {saveLabel}
      </button>
    </div>
  )
}
