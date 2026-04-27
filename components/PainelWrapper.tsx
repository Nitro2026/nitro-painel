'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

export default function PainelWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  useEffect(() => {
    if (isLogin) return
    if (!localStorage.getItem('nitro_auth')) {
      router.replace('/login')
    }
  }, [isLogin, router])

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex lg:h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:h-screen">
        {children}
      </main>
    </div>
  )
}
