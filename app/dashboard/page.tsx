'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, FolderKanban, TrendingUp, TrendingDown, Wallet, ArrowUpRight, X, CalendarDays, DollarSign, ChevronRight } from 'lucide-react'
import { getClientes, getProjetos, getTransacoes, updateProjeto, formatMoeda, formatData } from '@/lib/store'
import { Cliente, Projeto, Transacao } from '@/lib/types'

const STATUS_OPT = [
  { value: 'nao_iniciado', label: 'Não iniciado', color: '#44444E' },
  { value: 'em_andamento', label: 'Em andamento', color: '#F5C518' },
  { value: 'em_revisao',   label: 'Em revisão',   color: '#FB923C' },
  { value: 'concluido',    label: 'Concluído',    color: '#22C55E' },
  { value: 'pausado',      label: 'Pausado',      color: '#EF4444' },
]

export default function DashboardPage() {
  const [clientes,    setClientes]    = useState<Cliente[]>([])
  const [projetos,    setProjetos]    = useState<Projeto[]>([])
  const [transacoes,  setTransacoes]  = useState<Transacao[]>([])
  const [projetoSel,  setProjetoSel]  = useState<Projeto | null>(null)
  const [novoStatus,  setNovoStatus]  = useState<Projeto['status'] | null>(null)
  const [salvando,    setSalvando]    = useState(false)

  const reload = () => {
    setClientes(getClientes())
    setProjetos(getProjetos())
    setTransacoes(getTransacoes())
  }

  useEffect(() => { reload() }, [])

  function valorEfetivo(t: Transacao): number {
    if (t.tipo === 'saida') return t.valor
    const s = t.statusPagamento
    if (!s || s === 'pago') return t.valorPago ?? t.valor
    if (s === 'parcial') return t.valorPago ?? 0
    return 0
  }

  const mes      = new Date().toISOString().slice(0, 7)
  const txMes    = transacoes.filter(t => t.data.startsWith(mes))
  const entradas = txMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + valorEfetivo(t), 0)
  const saidas   = txMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo    = transacoes.reduce((s, t) => t.tipo === 'entrada' ? s + valorEfetivo(t) : s - t.valor, 0)

  const projetosAtivos   = projetos.filter(p => p.status === 'em_andamento').length
  const projetosRecentes = [...projetos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 4)
  const txRecentes       = [...transacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5)
  const mesLabel         = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function abrirProjeto(p: Projeto) {
    setProjetoSel(p)
    setNovoStatus(p.status)
  }

  function salvarStatus() {
    if (!projetoSel || !novoStatus) return
    setSalvando(true)
    updateProjeto(projetoSel.id, { status: novoStatus })
    reload()
    setProjetoSel(prev => prev ? { ...prev, status: novoStatus } : null)
    setSalvando(false)
  }

  const statusAlterado = novoStatus && novoStatus !== projetoSel?.status

  return (
    <div className="min-h-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

        {/* Cabeçalho */}
        <div className="mb-10 anim-up">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-display text-[42px] lg:text-[56px] leading-none tracking-[0.04em]" style={{ color: 'var(--text)' }}>
            VISÃO GERAL
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <KpiCard label="Clientes" value={String(clientes.length)}
            sub={`${clientes.filter(c => c.status === 'ativo').length} ativos`}
            icon={<Users size={15} />} href="/clientes" delay="d-1" />
          <KpiCard label="Em andamento" value={String(projetosAtivos)}
            sub={`${projetos.length} no total`}
            icon={<FolderKanban size={15} />} href="/projetos" delay="d-2" highlight />
          <KpiCard label={`Entradas · ${mesLabel}`} value={formatMoeda(entradas)}
            sub={`−${formatMoeda(saidas)} saídas`}
            icon={<TrendingUp size={15} />} href="/financeiro" delay="d-3" mono />
          <KpiCard label="Saldo acumulado" value={formatMoeda(saldo)}
            sub={saldo >= 0 ? 'Positivo' : 'Negativo'}
            icon={<Wallet size={15} />} href="/financeiro" delay="d-4" mono
            valueColor={saldo >= 0 ? 'var(--success)' : 'var(--danger)'} />
        </div>

        {/* Seções */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Projetos recentes */}
          <section className="lg:col-span-3 rounded-2xl overflow-hidden anim-up d-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <SectionHeader title="Projetos recentes" href="/projetos" />
            {projetosRecentes.length === 0
              ? <EmptyState text="Nenhum projeto ainda" />
              : (
                <ul>
                  {projetosRecentes.map((p, i) => {
                    const st = STATUS_OPT.find(s => s.value === p.status)
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => abrirProjeto(p)}
                          className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all group"
                          style={{
                            borderTop:   i > 0 ? '1px solid var(--border)' : undefined,
                            background:  'transparent',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: st?.color, boxShadow: `0 0 6px ${st?.color}66` }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.nome}</p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text2)' }}>
                              {p.clienteNome || 'Sem cliente'} · {st?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-semibold font-mono">{formatMoeda(p.valor)}</p>
                              {p.prazo && (
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                                  até {formatData(p.prazo)}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity"
                              style={{ color: 'var(--text3)' }} />
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
          </section>

          {/* Transações recentes */}
          <section className="lg:col-span-2 rounded-2xl overflow-hidden anim-up d-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <SectionHeader title="Últimas transações" href="/financeiro" />
            {txRecentes.length === 0
              ? <EmptyState text="Nenhuma transação ainda" />
              : (
                <ul>
                  {txRecentes.map((t, i) => (
                    <li key={t.id}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                      style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: t.tipo === 'entrada' ? '#22C55E14' : '#EF444414' }}>
                        {t.tipo === 'entrada'
                          ? <TrendingUp size={13} color="var(--success)" />
                          : <TrendingDown size={13} color="var(--danger)" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{t.descricao}</p>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text3)' }}>
                          {t.categoria || '—'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold font-mono shrink-0"
                        style={{ color: t.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.tipo === 'entrada' ? '+' : '−'}{formatMoeda(t.valor)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </div>
      </div>

      {/* ── Pop-up do Projeto ── */}
      {projetoSel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setProjetoSel(null) }}>

          <div className="w-full max-w-lg rounded-2xl overflow-hidden anim-scale"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>

            {/* Header do pop-up */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1"
                  style={{ color: 'var(--text3)' }}>
                  {projetoSel.clienteNome || 'Sem cliente'}
                </p>
                <h2 className="font-semibold text-lg leading-snug">{projetoSel.nome}</h2>
              </div>
              <button onClick={() => setProjetoSel(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-colors hover:brightness-125"
                style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
                <X size={15} />
              </button>
            </div>

            {/* Infos rápidas */}
            <div className="grid grid-cols-2 gap-px" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'var(--surface2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface3)' }}>
                  <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text3)' }}>Valor</p>
                  <p className="text-sm font-semibold font-mono mt-0.5">{formatMoeda(projetoSel.valor)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'var(--surface2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface3)' }}>
                  <CalendarDays size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text3)' }}>Prazo</p>
                  <p className="text-sm font-semibold mt-0.5">
                    {projetoSel.prazo ? formatData(projetoSel.prazo) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Corpo */}
            <div className="px-6 py-5 space-y-5">

              {/* Descrição */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
                  style={{ color: 'var(--text2)' }}>
                  Descrição
                </p>
                <p className="text-sm leading-relaxed"
                  style={{ color: projetoSel.descricao ? 'var(--text)' : 'var(--text3)' }}>
                  {projetoSel.descricao || 'Nenhuma descrição cadastrada para este projeto.'}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2.5"
                  style={{ color: 'var(--text2)' }}>
                  Status do projeto
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {STATUS_OPT.map(s => {
                    const ativo = novoStatus === s.value
                    return (
                      <button key={s.value}
                        onClick={() => setNovoStatus(s.value as Projeto['status'])}
                        className="py-2 px-1 rounded-xl text-[10px] font-semibold transition-all leading-tight"
                        style={{
                          background: ativo ? s.color + '22' : 'var(--surface2)',
                          color:      ativo ? s.color : 'var(--text2)',
                          border:     `1px solid ${ativo ? s.color + '55' : 'var(--border)'}`,
                        }}>
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 pb-6">
              <button onClick={() => setProjetoSel(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Fechar
              </button>
              <button
                onClick={salvarStatus}
                disabled={!statusAlterado || salvando}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: statusAlterado ? 'var(--accent)' : 'var(--surface2)',
                  color:      statusAlterado ? '#000' : 'var(--text3)',
                  cursor:     statusAlterado ? 'pointer' : 'default',
                  border:     `1px solid ${statusAlterado ? 'transparent' : 'var(--border)'}`,
                }}>
                {salvando ? 'Salvando…' : 'Salvar status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-componentes ── */

function KpiCard({ label, value, sub, icon, href, delay, highlight, mono, valueColor }: {
  label: string; value: string; sub: string; icon: React.ReactNode
  href: string; delay: string; highlight?: boolean; mono?: boolean; valueColor?: string
}) {
  return (
    <Link href={href}
      className={`anim-up ${delay} rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-200 hover:scale-[1.015]`}
      style={{
        background: highlight ? 'var(--accent)' : 'var(--surface)',
        border:     `1px solid ${highlight ? 'transparent' : 'var(--border)'}`,
      }}>
      <div className="flex items-center justify-between">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: highlight ? 'rgba(0,0,0,0.12)' : 'var(--surface2)', color: highlight ? '#000' : 'var(--text2)' }}>
          {icon}
        </span>
        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity"
          style={{ color: highlight ? '#000' : 'var(--text3)' }} />
      </div>
      <div>
        <p className={`leading-none ${mono ? 'font-mono text-xl lg:text-2xl font-semibold' : 'font-display text-[32px] lg:text-[38px] tracking-[0.03em]'}`}
          style={{ color: valueColor ?? (highlight ? '#000' : 'var(--text)') }}>
          {value}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-1.5"
          style={{ color: highlight ? 'rgba(0,0,0,0.5)' : 'var(--text3)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: highlight ? 'rgba(0,0,0,0.4)' : 'var(--text3)' }}>
          {sub}
        </p>
      </div>
    </Link>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text2)' }}>
        {title}
      </h2>
      <Link href={href}
        className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
        style={{ color: 'var(--accent)' }}>
        Ver todos <ArrowUpRight size={11} />
      </Link>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-sm" style={{ color: 'var(--text3)' }}>{text}</p>
    </div>
  )
}
