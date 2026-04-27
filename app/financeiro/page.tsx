'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, X, Search, ArrowUpRight } from 'lucide-react'
import { getTransacoes, saveTransacao, deleteTransacao, formatMoeda, formatData } from '@/lib/store'
import { Transacao } from '@/lib/types'

const CAT_ENTRADA = ['Pagamento de Projeto', 'Mensalidade', 'Consultoria', 'Freelance', 'Bônus', 'Outros']
const CAT_SAIDA   = ['Ferramentas', 'Assinaturas', 'Marketing', 'Equipe', 'Operacional', 'Impostos', 'Outros']

const EMPTY_FORM = {
  tipo: 'entrada' as Transacao['tipo'],
  descricao: '',
  categoria: '',
  valor: '',
  data: new Date().toISOString().slice(0, 10),
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [filtro,     setFiltro]     = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [busca,      setBusca]      = useState('')
  const [mes,        setMes]        = useState(new Date().toISOString().slice(0, 7))
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const reload = () => setTransacoes(getTransacoes())
  useEffect(() => { reload() }, [])

  const txMes    = transacoes.filter(t => t.data.startsWith(mes))
  const entradas = txMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const saidas   = txMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo    = transacoes.reduce((s, t) => t.tipo === 'entrada' ? s + t.valor : s - t.valor, 0)

  const filtradas = transacoes
    .filter(t => filtro === 'todos' || t.tipo === filtro)
    .filter(t => t.data.startsWith(mes))
    .filter(t => [t.descricao, t.categoria].join(' ').toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.data.localeCompare(a.data))

  const meses = Array.from(new Set(transacoes.map(t => t.data.slice(0, 7)))).sort().reverse()
  if (!meses.includes(mes)) meses.unshift(mes)

  function salvar() {
    if (!form.descricao.trim() || !form.valor) return
    saveTransacao({ ...form, valor: parseFloat(form.valor) })
    reload(); setModal(false); setForm(EMPTY_FORM)
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
            <h1 className="font-display text-[42px] lg:text-[52px] leading-none tracking-[0.04em]">FINANCEIRO</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>Fluxo de caixa da agência</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 self-start sm:self-auto shrink-0"
            style={{ background: 'var(--accent)', color: '#000' }}>
            <Plus size={16} strokeWidth={2.5} /> Nova Transação
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-8 anim-up d-1">
          <KpiMini
            label="Entradas do mês"
            value={formatMoeda(entradas)}
            icon={<TrendingUp size={14} />}
            color="var(--success)"
          />
          <KpiMini
            label="Saídas do mês"
            value={formatMoeda(saidas)}
            icon={<TrendingDown size={14} />}
            color="var(--danger)"
          />
          <div className="rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
            style={{
              background: saldo >= 0 ? '#22C55E0D' : '#EF44440D',
              border:     `1px solid ${saldo >= 0 ? '#22C55E22' : '#EF444422'}`,
            }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: saldo >= 0 ? '#22C55E18' : '#EF444418', color: saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                <Wallet size={14} />
              </span>
            </div>
            <p className="font-mono text-lg lg:text-2xl font-semibold leading-none"
              style={{ color: saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoeda(saldo)}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-1.5" style={{ color: 'var(--text3)' }}>
              Saldo acumulado
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 anim-up d-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text3)' }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar transação…"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <select value={mes} onChange={e => setMes(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {meses.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <div className="flex gap-1.5">
            {(['todos', 'entrada', 'saida'] as const).map(t => {
              const ativo = filtro === t
              const cor   = t === 'entrada' ? 'var(--success)' : t === 'saida' ? 'var(--danger)' : 'var(--accent)'
              return (
                <button key={t} onClick={() => setFiltro(t)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: ativo ? cor + '22' : 'var(--surface)',
                    color:      ativo ? cor : 'var(--text2)',
                    border:     `1px solid ${ativo ? cor + '44' : 'var(--border)'}`,
                  }}>
                  {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? <Vazio /> : (
          <div className="rounded-2xl overflow-hidden anim-up d-3"
            style={{ border: '1px solid var(--border)' }}>

            {/* Desktop table */}
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Tipo', 'Descrição', 'Categoria', 'Data', 'Valor', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase"
                      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(t => (
                  <tr key={t.id} className="group transition-all"
                    style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: t.tipo === 'entrada' ? '#22C55E18' : '#EF444418',
                          color:      t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)',
                        }}>
                        {t.tipo === 'entrada' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">{t.descricao}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--text2)' }}>{t.categoria || '—'}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--text2)' }}>{formatData(t.data)}</td>
                    <td className="px-5 py-4 font-mono font-semibold"
                      style={{ color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.tipo === 'entrada' ? '+' : '−'}{formatMoeda(t.valor)}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setConfirmDel(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:brightness-125"
                        style={{ background: '#EF444418', color: 'var(--danger)' }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtradas.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ background: 'var(--surface)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: t.tipo === 'entrada' ? '#22C55E14' : '#EF444414' }}>
                    {t.tipo === 'entrada'
                      ? <TrendingUp size={14} color="var(--success)" />
                      : <TrendingDown size={14} color="var(--danger)" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.descricao}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                      {t.categoria || '—'} · {formatData(t.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-semibold font-mono"
                      style={{ color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.tipo === 'entrada' ? '+' : '−'}{formatMoeda(t.valor)}
                    </p>
                    <button onClick={() => setConfirmDel(t.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{ background: '#EF444418', color: 'var(--danger)' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 anim-scale"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-base">Nova Transação</h2>
              <button onClick={() => setModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text2)' }}>Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['entrada', 'Entrada', TrendingUp, 'var(--success)'],
                     ['saida',   'Saída',   TrendingDown, 'var(--danger)']] as const).map(([val, lbl, Icon, cor]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, tipo: val, categoria: '' }))}
                      className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: form.tipo === val ? cor + '20' : 'var(--surface2)',
                        color:      form.tipo === val ? cor : 'var(--text2)',
                        border:     `1px solid ${form.tipo === val ? cor + '44' : 'var(--border)'}`,
                      }}>
                      <Icon size={15} /> {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                  Descrição *
                </label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Pagamento site cliente X"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                  Categoria
                </label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Selecionar…</option>
                  {(form.tipo === 'entrada' ? CAT_ENTRADA : CAT_SAIDA).map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>Valor *</label>
                  <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>Data</label>
                  <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
                <button onClick={salvar}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-95"
                  style={{ background: 'var(--accent)', color: '#000' }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 anim-scale"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
            <h2 className="font-semibold mb-2">Excluir transação?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button onClick={() => { deleteTransacao(confirmDel); reload(); setConfirmDel(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110"
                style={{ background: 'var(--danger)', color: '#fff' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiMini({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: color + '18', color }}>
          {icon}
        </span>
      </div>
      <p className="font-mono text-lg lg:text-2xl font-semibold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-1.5" style={{ color: 'var(--text3)' }}>
        {label}
      </p>
    </div>
  )
}

function Vazio() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 anim-up">
      <Wallet size={44} style={{ color: 'var(--text3)' }} strokeWidth={1.2} />
      <p className="font-semibold" style={{ color: 'var(--text2)' }}>Nenhuma transação encontrada</p>
      <p className="text-sm" style={{ color: 'var(--text3)' }}>Registre sua primeira transação acima</p>
    </div>
  )
}
