import type { Metadata } from 'next'
import './globals.css'
import PainelWrapper from '@/components/PainelWrapper'

export const metadata: Metadata = {
  title: 'Nitro Agência Digital — Painel',
  description: 'Painel de gestão interno da Nitro Agência Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PainelWrapper>
          {children}
        </PainelWrapper>
      </body>
    </html>
  )
}
