'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, X, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { getTransacoes, saveTransacao, deleteTransacao, updateTransacao, formatMoeda, formatData } from '@/lib/store'
import { Transacao } from '@/lib/types'

const CAT_ENTRADA = ['Pagamento de Projeto', 'Mensalidade', 'Consultoria', 'Freelance', 'Bônus', 'Outros']
const CAT_SAIDA   = ['Ferramentas', 'Assinaturas', 'Marketing', 'Equipe', 'Operacional', 'Impostos', 'Outros']

const EMPTY_FORM = {
  tipo: 'entrada' as Transacao['tipo'],
  descricao: '',
  categoria: '',
  valor: '',
  valorPago: '',
  statusPagamento: 'pago' as 'pago' | 'parcial' | 'pendente',
  data: new Date().toISOString().slice(0, 10),
}

function getValorEfetivo(t: Transacao): number {
  if (t.tipo === 'saida') return t.valor
  const s = t.statusPagamento
  if (!s || s === 'pago') return t.valorPago ?? t.valor
  if (s === 'parcial') return t.valorPago ?? 0
  return 0
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [filtro,     setFiltro]     = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [busca,      setBusca]      = useState('')
  const [mes,        setMes]        = useState(new Date().toISOString().slice(0, 7))
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [editando,   setEditando]   = useState<Transacao | null>(null)
  const [editForm,   setEditForm]   = useState({ statusPagamento: 'pago' as 'pago' | 'parcial' | 'pendente', valorPago: '' })

  const reload = () => setTransacoes(getTransacoes())
  useEffect(() => { reload() }, [])

  const txMes       = transacoes.filter(t => t.data.startsWith(mes))
  const entradasMes = txMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + getValorEfetivo(t), 0)
  const saidasMes   = txMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo       = transacoes.reduce((s, t) => t.tipo === 'entrada' ? s + getValorEfetivo(t) : s - t.valor, 0)

  const aReceber = transacoes
    .filter(t => t.tipo === 'entrada' && (t.statusPagamento === 'parcial' || t.statusPagamento === 'pendente'))
    .reduce((s, t) => s + (t.valor - (t.valorPago ?? 0)), 0)

  const todasEntradas = transacoes.filter(t => t.tipo === 'entrada')
  const chartPago     = todasEntradas.reduce((s, t) => s + getValorEfetivo(t), 0)
  const chartParcial  = todasEntradas.filter(t => t.statusPagamento === 'parcial').reduce((s, t) => s + (t.valor - (t.valorPago ?? 0)), 0)
  const chartPendente = todasEntradas.filter(t => t.statusPagamento === 'pendente').reduce((s, t) => s + t.valor, 0)

  const filtradas = transacoes
    .filter(t => filtro === 'todos' || t.tipo === filtro)
    .filter(t => t.data.startsWith(mes))
    .filter(t => [t.descricao, t.categoria].join(' ').toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.data.localeCompare(a.data))

  const meses = Array.from(new Set(transacoes.map(t => t.data.slice(0, 7)))).sort().reverse()
  if (!meses.includes(mes)) meses.unshift(mes)

  function salvar() {
    if (!form.descricao.trim() || !form.valor) return
    const valor = parseFloat(form.valor)
    let valorPago: number | undefined
    let statusPagamento: 'pago' | 'parcial' | 'pendente' | undefined

    if (form.tipo === 'entrada') {
      statusPagamento = form.statusPagamento
      valorPago = form.statusPagamento === 'pago'
        ? valor
        : form.statusPagamento === 'parcial'
          ? parseFloat(form.valorPago) || 0
          : 0
    }

    saveTransacao({ tipo: form.tipo, descricao: form.descricao, categoria: form.categoria, valor, valorPago, statusPagamento, data: form.data })
    reload()
    setModal(false)
    setForm(EMPTY_FORM)
  }

  function marcarPago(t: Transacao) {
    updateTransacao(t.id, { statusPagamento: 'pago', valorPago: t.valor })
    reload()
  }

  function abrirEdicao(t: Transacao) {
    setEditando(t)
    setEditForm({
      statusPagamento: t.statusPagamento ?? 'pago',
      valorPago: String(t.valorPago ?? t.valor),
    })
  }

  function salvarEdicao() {
    if (!editando) return
    const novoStatus = editForm.statusPagamento
    const novoValorPago = novoStatus === 'pago'
      ? editando.valor
      : novoStatus === 'parcial'
        ? parseFloat(editForm.valorPago) || 0
        : 0
    updateTransacao(editando.id, { statusPagamento: novoStatus, valorPago: novoValorPago })
    reload()
    setEditando(null)
  }

  return (
    <div className="min-h-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 anim-up">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text3)' }}>Gestão</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 anim-up d-1">
          <KpiMini label="Entradas recebidas" value={formatMoeda(entradasMes)} icon={<TrendingUp size={14} />} color="var(--success)" />
          <KpiMini label="Saídas do mês"      value={formatMoeda(saidasMes)}   icon={<TrendingDown size={14} />} color="var(--danger)" />
          <KpiMini label="A receber"           value={formatMoeda(aReceber)}    icon={<Clock size={14} />}        color="var(--warning)" />
          <div className="rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
            style={{ background: saldo >= 0 ? '#22C55E0D' : '#EF44440D', border: `1px solid ${saldo >= 0 ? '#22C55E22' : '#EF444422'}` }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: saldo >= 0 ? '#22C55E18' : '#EF444418', color: saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              <Wallet size={14} />
            </span>
            <p className="font-mono text-lg lg:text-2xl font-semibold leading-none"
              style={{ color: saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoeda(saldo)}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-1.5" style={{ color: 'var(--text3)' }}>
              Saldo (somente pago)
            </p>
          </div>
        </div>

        {/* Gráfico de recebimentos */}
        {(chartPago + chartParcial + chartPendente) > 0 && (
          <div className="rounded-2xl p-6 mb-6 anim-up d-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-6" style={{ color: 'var(--text3)' }}>
              Situação de Recebimentos
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <DonutChart pago={chartPago} parcial={chartParcial} pendente={chartPendente} />
              <div className="flex-1 w-full space-y-4">
                <LegendaItem cor="#22C55E" label="Pago"              valor={chartPago}     total={chartPago + chartParcial + chartPendente} />
                <LegendaItem cor="#F5C518" label="Parcial — restante" valor={chartParcial}  total={chartPago + chartParcial + chartPendente} />
                <LegendaItem cor="#44444E" label="Pendente"           valor={chartPendente} total={chartPago + chartParcial + chartPendente} />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 anim-up d-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar transação…"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <select value={mes} onChange={e => setMes(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm"
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
                  style={{ background: ativo ? cor + '22' : 'var(--surface)', color: ativo ? cor : 'var(--text2)', border: `1px solid ${ativo ? cor + '44' : 'var(--border)'}` }}>
                  {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? <Vazio /> : (
          <div className="rounded-2xl overflow-hidden anim-up d-4" style={{ border: '1px solid var(--border)' }}>
            {/* Desktop */}
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Tipo', 'Descrição', 'Categoria', 'Data', 'Valor', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase"
                      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(t => {
                  const status = t.statusPagamento ?? (t.tipo === 'entrada' ? 'pago' : undefined)
                  return (
                    <tr key={t.id} className="group transition-all cursor-pointer"
                      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
                      onClick={() => t.tipo === 'entrada' && abrirEdicao(t)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: t.tipo === 'entrada' ? '#22C55E18' : '#EF444418', color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.tipo === 'entrada' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">{t.descricao}</td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--text2)' }}>{t.categoria || '—'}</td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--text2)' }}>{formatData(t.data)}</td>
                      <td className="px-5 py-4 font-mono font-semibold"
                        style={{ color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.tipo === 'saida' && <>−{formatMoeda(t.valor)}</>}
                        {t.tipo === 'entrada' && status === 'parcial' && (
                          <>{formatMoeda(t.valorPago ?? 0)} <span className="text-xs font-normal" style={{ color: 'var(--text3)' }}>/ {formatMoeda(t.valor)}</span></>
                        )}
                        {t.tipo === 'entrada' && status !== 'parcial' && (
                          <>{status === 'pendente' ? '' : '+'}{formatMoeda(status === 'pendente' ? t.valor : getValorEfetivo(t))}</>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {t.tipo === 'entrada' && status && <BadgeStatus status={status} />}
                      </td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {t.tipo === 'entrada' && (status === 'parcial' || status === 'pendente') && (
                            <button onClick={() => marcarPago(t)} title="Marcar como pago total"
                              className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:brightness-125"
                              style={{ background: '#22C55E18', color: 'var(--success)' }}>
                              <CheckCircle size={12} />
                            </button>
                          )}
                          <button onClick={() => setConfirmDel(t.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:brightness-125"
                            style={{ background: '#EF444418', color: 'var(--danger)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtradas.map(t => {
                const status = t.statusPagamento ?? (t.tipo === 'entrada' ? 'pago' : undefined)
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" style={{ background: 'var(--surface)' }}
                    onClick={() => t.tipo === 'entrada' && abrirEdicao(t)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: t.tipo === 'entrada' ? '#22C55E14' : '#EF444414' }}>
                      {t.tipo === 'entrada' ? <TrendingUp size={14} color="var(--success)" /> : <TrendingDown size={14} color="var(--danger)" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.descricao}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs" style={{ color: 'var(--text3)' }}>{t.categoria || '—'} · {formatData(t.data)}</p>
                        {t.tipo === 'entrada' && status && <BadgeStatus status={status} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold font-mono"
                          style={{ color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.tipo === 'entrada' ? '+' : '−'}
                          {formatMoeda(status === 'parcial' ? (t.valorPago ?? 0) : getValorEfetivo(t))}
                        </p>
                        {status === 'parcial' && (
                          <p className="text-[10px]" style={{ color: 'var(--text3)' }}>de {formatMoeda(t.valor)}</p>
                        )}
                      </div>
                      {t.tipo === 'entrada' && (status === 'parcial' || status === 'pendente') && (
                        <button onClick={e => { e.stopPropagation(); marcarPago(t) }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg"
                          style={{ background: '#22C55E18', color: 'var(--success)' }}>
                          <CheckCircle size={12} />
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); setConfirmDel(t.id) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg"
                        style={{ background: '#EF444418', color: 'var(--danger)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Transação */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 anim-scale overflow-y-auto max-h-[90vh]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-base">Nova Transação</h2>
              <button onClick={() => { setModal(false); setForm(EMPTY_FORM) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text2)' }}>Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['entrada', 'Entrada', TrendingUp, 'var(--success)'], ['saida', 'Saída', TrendingDown, 'var(--danger)']] as const).map(([val, lbl, Icon, cor]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, tipo: val, categoria: '', statusPagamento: 'pago' }))}
                      className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: form.tipo === val ? cor + '20' : 'var(--surface2)', color: form.tipo === val ? cor : 'var(--text2)', border: `1px solid ${form.tipo === val ? cor + '44' : 'var(--border)'}` }}>
                      <Icon size={15} /> {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>Descrição *</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Pagamento site cliente X"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>Categoria</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Selecionar…</option>
                  {(form.tipo === 'entrada' ? CAT_ENTRADA : CAT_SAIDA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Valor + Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                    {form.tipo === 'entrada' ? 'Valor total *' : 'Valor *'}
                  </label>
                  <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>Data</label>
                  <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>

              {/* Status de pagamento (só entradas) */}
              {form.tipo === 'entrada' && (
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--text2)' }}>
                    Status de pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      ['pago',    'Pago total', CheckCircle, '#22C55E'],
                      ['parcial', 'Parcial',    AlertCircle, '#F5C518'],
                      ['pendente','Pendente',   Clock,       '#FB923C'],
                    ] as const).map(([val, lbl, Icon, cor]) => (
                      <button key={val} onClick={() => setForm(f => ({ ...f, statusPagamento: val }))}
                        className="py-3 px-2 rounded-xl text-[11px] font-semibold flex flex-col items-center gap-1.5 transition-all"
                        style={{ background: form.statusPagamento === val ? cor + '20' : 'var(--surface2)', color: form.statusPagamento === val ? cor : 'var(--text3)', border: `1px solid ${form.statusPagamento === val ? cor + '44' : 'var(--border)'}` }}>
                        <Icon size={14} />
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Valor pago (parcial) */}
              {form.tipo === 'entrada' && form.statusPagamento === 'parcial' && (
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--text2)' }}>
                    Valor já pago *
                  </label>
                  <input type="number" value={form.valorPago} onChange={e => setForm(f => ({ ...f, valorPago: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  {form.valor && form.valorPago && parseFloat(form.valorPago) < parseFloat(form.valor) && (
                    <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--warning)' }}>
                      A receber: {formatMoeda(parseFloat(form.valor) - parseFloat(form.valorPago))}
                    </p>
                  )}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModal(false); setForm(EMPTY_FORM) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
                <button onClick={salvar}
                  disabled={!form.descricao.trim() || !form.valor}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
                  style={{ background: 'var(--accent)', color: '#000' }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup de edição de pagamento */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditando(null) }}>
          <div className="w-full max-w-sm rounded-2xl p-6 anim-scale"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5"
              style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text3)' }}>
                  Editar pagamento
                </p>
                <h2 className="font-semibold text-base leading-snug truncate">{editando.descricao}</h2>
                <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text2)' }}>
                  Total: {formatMoeda(editando.valor)}
                </p>
              </div>
              <button onClick={() => setEditando(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                <X size={15} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Status */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
                  style={{ color: 'var(--text2)' }}>
                  Status de pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ['pago',    'Pago total', CheckCircle, '#22C55E'],
                    ['parcial', 'Parcial',    AlertCircle, '#F5C518'],
                    ['pendente','Pendente',   Clock,       '#FB923C'],
                  ] as const).map(([val, lbl, Icon, cor]) => (
                    <button key={val}
                      onClick={() => setEditForm(f => ({ ...f, statusPagamento: val }))}
                      className="py-3 px-2 rounded-xl text-[11px] font-semibold flex flex-col items-center gap-1.5 transition-all"
                      style={{
                        background: editForm.statusPagamento === val ? cor + '20' : 'var(--surface2)',
                        color:      editForm.statusPagamento === val ? cor : 'var(--text3)',
                        border:     `1px solid ${editForm.statusPagamento === val ? cor + '44' : 'var(--border)'}`,
                      }}>
                      <Icon size={14} />
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor pago (parcial) */}
              {editForm.statusPagamento === 'parcial' && (
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: 'var(--text2)' }}>
                    Valor já pago
                  </label>
                  <input
                    type="number"
                    value={editForm.valorPago}
                    onChange={e => setEditForm(f => ({ ...f, valorPago: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  {editForm.valorPago && parseFloat(editForm.valorPago) < editando.valor && (
                    <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--warning)' }}>
                      A receber: {formatMoeda(editando.valor - parseFloat(editForm.valorPago))}
                    </p>
                  )}
                </div>
              )}

              {/* Resumo */}
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text3)' }}>Total do lançamento</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--text)' }}>{formatMoeda(editando.valor)}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text3)' }}>Valor pago</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--success)' }}>
                    {editForm.statusPagamento === 'pago'
                      ? formatMoeda(editando.valor)
                      : editForm.statusPagamento === 'parcial'
                        ? formatMoeda(parseFloat(editForm.valorPago) || 0)
                        : formatMoeda(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text3)' }}>A receber</span>
                  <span className="font-mono font-semibold" style={{ color: 'var(--warning)' }}>
                    {editForm.statusPagamento === 'pago'
                      ? formatMoeda(0)
                      : editForm.statusPagamento === 'parcial'
                        ? formatMoeda(Math.max(0, editando.valor - (parseFloat(editForm.valorPago) || 0)))
                        : formatMoeda(editando.valor)}
                  </span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button onClick={() => setEditando(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
                <button onClick={salvarEdicao}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
                  style={{ background: 'var(--accent)', color: '#000' }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
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

/* ── Sub-componentes ── */

function KpiMini({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <span className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
        style={{ background: color + '18', color }}>
        {icon}
      </span>
      <p className="font-mono text-lg lg:text-2xl font-semibold leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-1.5" style={{ color: 'var(--text3)' }}>{label}</p>
    </div>
  )
}

function BadgeStatus({ status }: { status: 'pago' | 'parcial' | 'pendente' }) {
  const map = {
    pago:     { label: 'Pago',     cor: '#22C55E' },
    parcial:  { label: 'Parcial',  cor: '#F5C518' },
    pendente: { label: 'Pendente', cor: '#FB923C' },
  }
  const { label, cor } = map[status]
  return (
    <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: cor + '18', color: cor, border: `1px solid ${cor}30` }}>
      {label}
    </span>
  )
}

function DonutChart({ pago, parcial, pendente }: { pago: number; parcial: number; pendente: number }) {
  const total = pago + parcial + pendente
  if (!total) return null

  const r  = 52
  const cx = 70, cy = 70
  const c  = 2 * Math.PI * r

  const segs = [
    { v: pago,    cor: '#22C55E' },
    { v: parcial, cor: '#F5C518' },
    { v: pendente,cor: '#2E2E38' },
  ]

  let cumulative = 0
  const arcs = segs.map(s => {
    const len = (s.v / total) * c
    const rot = -90 + (cumulative / total) * 360
    cumulative += s.v
    return { ...s, len, rot }
  })

  const pct = Math.round((pago / total) * 100)

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16161C" strokeWidth={20} />
      {arcs.map((a, i) => a.v > 0 && (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.cor} strokeWidth={20}
          strokeDasharray={`${a.len} ${c - a.len}`}
          style={{ transform: `rotate(${a.rot}deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#EEEEF5" fontSize="19" fontWeight="700" fontFamily="monospace">
        {pct}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#44444E" fontSize="8" letterSpacing="2">
        PAGO
      </text>
    </svg>
  )
}

function LegendaItem({ cor, label, valor, total }: { cor: string; label: string; valor: number; total: number }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cor }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{formatMoeda(valor)}</span>
          <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: 'var(--text3)' }}>{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cor }} />
      </div>
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
