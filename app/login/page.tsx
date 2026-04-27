'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, ArrowRight } from 'lucide-react'
import { DottedSurface } from '@/components/DottedSurface'

const SENHA = 'nitro2026'

export default function LoginPage() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <DottedSurface />

      {/* glow central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 50% 65%, rgba(245,197,24,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6 anim-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/nitro.png"
            alt="Nitro Agência Digital"
            width={140}
            height={70}
            className="object-contain mb-5"
            priority
          />
          <p
            className="text-[10px] font-semibold tracking-[0.25em] uppercase"
            style={{ color: 'var(--text3)' }}
          >
            Painel de Gestão
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
        >
          <h1
            className="font-display text-[32px] tracking-[0.06em] leading-none mb-1"
            style={{ color: 'var(--text)' }}
          >
            ACESSO
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text3)' }}>
            Digite a senha para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text3)' }}
              />
              <input
                type="password"
                value={senha}
                onChange={e => {
                  setSenha(e.target.value)
                  setErro(false)
                }}
                placeholder="Senha"
                autoFocus
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                style={{
                  background: 'var(--surface2)',
                  border: `1px solid ${erro ? 'var(--danger)' : 'var(--border)'}`,
                  color: 'var(--text)',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {erro && (
              <p
                className="text-xs text-center anim-in"
                style={{ color: 'var(--danger)' }}
              >
                Senha incorreta. Tente novamente.
              </p>
            )}

            <button
              type="submit"
              disabled={!ativo}
              className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: ativo ? 'var(--accent)' : 'var(--surface3)',
                color: ativo ? '#000' : 'var(--text3)',
                cursor: ativo ? 'pointer' : 'default',
                border: `1px solid ${ativo ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {carregando ? 'Entrando…' : (
                <>Entrar <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[10px] mt-6 tracking-[0.08em]"
          style={{ color: 'var(--text3)' }}
        >
          NITRO AGÊNCIA DIGITAL © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
