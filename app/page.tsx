'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardResumo } from '@/lib/data'
import type { PessoaComUltimoPeso } from '@/lib/types'

type Resumo = {
  totalPessoas: number
  comPeso: number
  semPeso: number
  mediaImc: number | null
  recentes: PessoaComUltimoPeso[]
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Carrega os indicadores do dashboard na abertura da página.
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getDashboardResumo()
        setResumo(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="skeleton" style={{ height: 36, width: 220, marginBottom: 'var(--space-4)' }} />
        <div className="skeleton" style={{ height: 90, width: '100%' }} />
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-header__title">Dashboard</h1>
        <Link href="/pessoas" className="btn btn--primary">
          Gerenciar pessoas
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="grid grid--2" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Cards de KPI para leitura rápida do estado do sistema */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p className="muted" style={{ margin: 0 }}>Total de pessoas</p>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: '2rem', fontWeight: 700 }}>{resumo?.totalPessoas ?? 0}</p>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p className="muted" style={{ margin: 0 }}>Com ultimo peso registrado</p>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: '2rem', fontWeight: 700 }}>{resumo?.comPeso ?? 0}</p>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p className="muted" style={{ margin: 0 }}>Sem registro de peso</p>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: '2rem', fontWeight: 700 }}>{resumo?.semPeso ?? 0}</p>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p className="muted" style={{ margin: 0 }}>Media de IMC</p>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: '2rem', fontWeight: 700 }}>
            {resumo?.mediaImc ?? '--'}
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)' }}>Cadastros recentes</h2>
        {/* Lista das 5 pessoas mais recentes para facilitar navegação ao detalhe */}
        {!resumo?.recentes.length ? (
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <p className="muted" style={{ margin: 0 }}>Nenhuma pessoa cadastrada ainda.</p>
          </div>
        ) : (
          <ul className="grid grid--2">
            {resumo.recentes.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pessoa/${p.id}`}
                  className="card card--clickable"
                  style={{ display: 'block', padding: 'var(--space-4)', color: 'inherit' }}
                >
                  <strong>{p.nome}</strong>
                  <p className="muted" style={{ margin: 'var(--space-2) 0 0' }}>
                    {p.idade} anos · {p.altura} m
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
