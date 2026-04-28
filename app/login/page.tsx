'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

const SENHA = 'nitro2026'

export default function LoginPage() {
  const [senha,      setSenha]      = useState('')
  const [mostrar,    setMostrar]    = useState(false)
  const [erro,       setErro]       = useState(false)
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senha || carregando) return
    setCarregando(true)
    setErro(false)

    setTimeout(() => {
      if (senha === SENHA) {
        localStorage.setItem('nitro_auth', 'true')
        router.push('/dashboard')
      } else {
        setErro(true)
        setCarregando(false)
      }
    }, 600)
  }

  const ativo = !!senha && !carregando

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Painel esquerdo — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute bottom-0 left-0 w-full h-[55%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 20% 110%, rgba(245,197,24,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000" stroke="none">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
            </svg>
          </div>
          <span className="font-display text-[22px] tracking-[0.1em]" style={{ color: 'var(--text)' }}>
            NITRO
          </span>
        </div>

        {/* Texto central */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
            Painel de Gestão
          </p>
          <h2 className="text-2xl font-semibold leading-snug mb-3" style={{ color: 'var(--text)' }}>
            Controle total da sua agência em um só lugar
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
            Clientes, projetos e financeiro organizados para você focar no que importa: crescer.
          </p>
        </div>

        {/* Rodapé */}
        <p className="relative z-10 text-[10px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>
          NITRO AGÊNCIA DIGITAL © {new Date().getFullYear()}
        </p>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">

        {/* Glow sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 80%, rgba(245,197,24,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[360px] anim-up">

          {/* Logo mobile */}
          <div className="flex lg:hidden flex-col items-center mb-10">
            <Image
              src="/nitro.png"
              alt="Nitro Agência Digital"
              width={130}
              height={65}
              className="object-contain mb-4"
              priority
            />
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: 'var(--text3)' }}>
              Painel de Gestão
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Acesso restrito a colaboradores autorizados
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Campo senha */}
            <div>
              <label
                className="block text-xs font-semibold mb-2 tracking-[0.08em]"
                style={{ color: 'var(--text2)' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro(false) }}
                  placeholder="Digite sua senha"
                  autoFocus
                  className="w-full pr-11 pl-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background:  'var(--surface)',
                    border:      `1px solid ${erro ? 'var(--danger)' : 'var(--border2)'}`,
                    color:       'var(--text)',
                    outline:     'none',
                  }}
                  onFocus={e  => { if (!erro) e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={e   => { if (!erro) e.currentTarget.style.borderColor = 'var(--border2)' }}
                />
                <button
                  type="button"
                  onClick={() => setMostrar(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: 'var(--text3)' }}
                  tabIndex={-1}
                >
                  {mostrar ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {erro && (
                <p className="text-xs mt-2 anim-in" style={{ color: 'var(--danger)' }}>
                  Senha incorreta. Tente novamente.
                </p>
              )}
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={!ativo}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: ativo ? 'var(--accent)' : 'var(--surface)',
                color:      ativo ? '#000' : 'var(--text3)',
                cursor:     ativo ? 'pointer' : 'default',
                border:     `1px solid ${ativo ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {carregando
                ? <><Loader2 size={15} className="animate-spin" /> Entrando…</>
                : <>Entrar <ArrowRight size={15} /></>
              }
            </button>

          </form>

          {/* Rodapé mobile */}
          <p className="lg:hidden text-center text-[10px] mt-8 tracking-[0.08em]" style={{ color: 'var(--text3)' }}>
            NITRO AGÊNCIA DIGITAL © {new Date().getFullYear()}
          </p>

        </div>
      </div>
    </div>
  )
}
