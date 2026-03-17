import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="container header__inner">
          <Link href="/" className="logo">
            FitTrack
          </Link>
          <span className="tagline">Controle de peso e IMC</span>
        </div>
      </header>
      <main className="main">
        <div className="container app-shell">
          <Sidebar />
          <section className="content-area">{children}</section>
        </div>
      </main>
    </div>
  )
}
