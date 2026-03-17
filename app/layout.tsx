/**
 * Layout raiz da aplicação (Next.js App Router)
 *
 * Define fonte (Outfit), idioma (pt-BR), metadados e envolve todas as páginas
 * no componente Layout (cabeçalho + área principal).
 */

import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Layout from '@/components/Layout'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'FitTrack — Controle de Peso',
  description: 'Sistema de controle de peso com cadastro de pessoas, registro de peso, IMC e gráfico de evolução.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body style={{ fontFamily: 'var(--font-outfit), var(--font)' }}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
