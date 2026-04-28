'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FolderKanban, Wallet, Menu, X, Zap, LogOut } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes',  label: 'Clientes',  icon: Users },
  { href: '/projetos',  label: 'Projetos',  icon: FolderKanban },
  { href: '/financeiro',label: 'Financeiro',icon: Wallet },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
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
      <header className="lg:hidden flex items-center justify-between px-5 h-[56px] sticky top-0 z-40"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <button onClick={() => setOpen(v => !v)} aria-label="Menu"
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col lg:translate-x-0 lg:static lg:h-screen transition-transform duration-300 ease-[cubic-bezier(.22,.68,0,1.2)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

        {/* Logo area */}
        <div className="flex items-center gap-3 px-6 h-[68px] shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link href={href}
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background:   active ? 'var(--accent-low)' : 'transparent',
                      color:        active ? 'var(--accent)' : 'var(--text2)',
                    }}>
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                        style={{ background: 'var(--accent)' }} />
                    )}
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8}
                      color={active ? 'var(--accent)' : 'var(--text2)'} />
                    <span>{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--surface3)', border: '1px solid var(--border2)' }}>
              <Zap size={13} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>Nitro Agência</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text3)' }}>Painel de Gestão</p>
            </div>
            <button
              onClick={sair}
              title="Sair"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:brightness-125 shrink-0"
              style={{ background: 'var(--surface3)', color: 'var(--text3)' }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent)' }}>
        <Zap size={15} fill="#000" color="#000" strokeWidth={2.5} />
      </div>
      <div>
        <span className="font-display text-[22px] tracking-[0.08em] leading-none block"
          style={{ color: 'var(--text)' }}>
          NITRO
        </span>
        <span className="text-[9px] tracking-[0.2em] uppercase leading-none"
          style={{ color: 'var(--text3)' }}>
          Agência Digital
        </span>
      </div>
    </div>
  )
}
