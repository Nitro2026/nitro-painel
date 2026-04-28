'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderKanban, Wallet,
  Menu, X, Zap, LogOut, Settings, UsersRound, ShieldCheck,
} from 'lucide-react'

const NAV_WORKSPACE = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/clientes',  label: 'Clientes',   icon: Users },
  { href: '/projetos',  label: 'Projetos',   icon: FolderKanban },
  { href: '/financeiro',label: 'Financeiro', icon: Wallet },
]

const NAV_EQUIPE_SOON = [
  { label: 'Colaboradores', icon: UsersRound },
  { label: 'Permissões',    icon: ShieldCheck },
]

const NAV_SISTEMA_SOON = [
  { label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  function sair() {
    localStorage.removeItem('nitro_auth')
    router.push('/login')
  }

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  return (
    <>
      {/* Mobile header */}
      <header
        className="lg:hidden flex items-center justify-between px-5 h-[56px] sticky top-0 z-40"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={13} fill="#000" color="#000" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[18px] tracking-[0.08em] leading-none" style={{ color: 'var(--text)' }}>
            NITRO
          </span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col lg:translate-x-0 lg:static lg:h-screen transition-transform duration-300 ease-[cubic-bezier(.22,.68,0,1.2)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 248, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* ── Workspace header ── */}
        <div
          className="flex items-center gap-3 px-5 h-[64px] shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Zap size={15} fill="#000" color="#000" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[20px] tracking-[0.08em] leading-none" style={{ color: 'var(--text)' }}>
              NITRO
            </p>
            <p className="text-[9px] tracking-[0.18em] uppercase leading-none mt-0.5" style={{ color: 'var(--text3)' }}>
              Agência Digital
            </p>
          </div>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">

          {/* Grupo: WORKSPACE */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>
              Workspace
            </p>
            <ul className="space-y-0.5">
              {NAV_WORKSPACE.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                      style={{
                        background: active ? 'var(--accent-low)' : 'transparent',
                        color:      active ? 'var(--accent)' : 'var(--text2)',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface2)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Grupo: EQUIPE (em breve) */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>
                Equipe
              </p>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide"
                style={{ background: 'var(--surface3)', color: 'var(--text3)', border: '1px solid var(--border2)' }}
              >
                Em breve
              </span>
            </div>
            <ul className="space-y-0.5">
              {NAV_EQUIPE_SOON.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-not-allowed select-none"
                    style={{ color: 'var(--text3)', opacity: 0.5 }}
                  >
                    <Icon size={15} strokeWidth={1.6} />
                    <span>{label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Grupo: SISTEMA */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>
                Sistema
              </p>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide"
                style={{ background: 'var(--surface3)', color: 'var(--text3)', border: '1px solid var(--border2)' }}
              >
                Em breve
              </span>
            </div>
            <ul className="space-y-0.5">
              {NAV_SISTEMA_SOON.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-not-allowed select-none"
                    style={{ color: 'var(--text3)', opacity: 0.5 }}
                  >
                    <Icon size={15} strokeWidth={1.6} />
                    <span>{label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </nav>

        {/* ── Usuário / Footer ── */}
        <div className="shrink-0 px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-default"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              N
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-none" style={{ color: 'var(--text)' }}>
                Nitro Agência
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide"
                  style={{ background: '#F5C51820', color: 'var(--accent)', border: '1px solid #F5C51830' }}
                >
                  Admin
                </span>
              </div>
            </div>

            {/* Sair */}
            <button
              onClick={sair}
              title="Sair"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:brightness-125 shrink-0"
              style={{ color: 'var(--text3)' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

      </aside>
    </>
  )
}
