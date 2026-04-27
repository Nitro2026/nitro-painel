import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Nitro Agência Digital — Painel',
  description: 'Painel de gestão interno da Nitro Agência Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex lg:h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto lg:h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
