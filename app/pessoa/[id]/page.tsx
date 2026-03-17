'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getPessoa, getHistoricoPeso, registrarPeso } from '@/lib/data'
import type { PessoaComUltimoPeso, EvolucaoPeso } from '@/lib/types'
import FormField from '@/components/FormField'
import { validatePesoForm } from '@/lib/validation'

function formatDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export default function PersonDetail({
  params,
}: {
  params: { id: string }
}) {
  const id = params.id
  const [pessoa, setPessoa] = useState<PessoaComUltimoPeso | null>(null)
  const [historico, setHistorico] = useState<EvolucaoPeso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [peso, setPeso] = useState('')
  const [dataRegistro, setDataRegistro] = useState('')
  const [pesoError, setPesoError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [p, h] = await Promise.all([
        getPessoa(id),
        getHistoricoPeso(id),
      ])
      setPessoa(p ?? null)
      setHistorico(h)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    const result = validatePesoForm(peso, dataRegistro || undefined)
    if (!result.valid || result.parsedPeso == null) {
      setPesoError(result.error)
      return
    }
    const p = result.parsedPeso
    setPesoError(null)
    setError(null)
    setSubmitting(true)
    try {
      await registrarPeso(id, p, dataRegistro || undefined)
      setPeso('')
      setDataRegistro('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar peso')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-state" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <div className="skeleton" style={{ height: 32, width: 180, margin: '0 auto' }} />
        <p className="muted" style={{ marginTop: 'var(--space-4)' }}>Carregando...</p>
      </div>
    )
  }

  if (!pessoa) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ marginTop: 0 }}>Pessoa nao encontrada.</p>
        {error && <p className="muted" style={{ color: 'var(--danger)' }}>{error}</p>}
        <Link href="/pessoas" className="btn btn--secondary">
          Voltar para pessoas
        </Link>
      </div>
    )
  }

  const chartData = historico.map((x) => ({
    data: formatDate(x.data),
    peso: x.peso,
    imc: x.imc ?? 0,
  }))

  return (
    <div>
      <Link
        href="/pessoas"
        className="muted link--plain"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-6)',
          textDecoration: 'none',
        }}
      >
        ← Voltar
      </Link>

      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>
          {pessoa.nome}
        </h1>
        <p className="muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
          {pessoa.idade} anos · {pessoa.altura} m
          {pessoa.ultimo_peso != null && (
            <> · Último peso: <strong style={{ color: 'var(--text)' }}>{pessoa.ultimo_peso} kg</strong></>
          )}
          {pessoa.ultimo_imc != null && (
            <> · IMC: <strong style={{ color: 'var(--text)' }}>{pessoa.ultimo_imc}</strong></>
          )}
        </p>
      </div>

      {error && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-4)',
        }}>
          Registrar peso
        </h2>
        <form onSubmit={handleSubmit} className="form-block">
          <div className="form-row">
            <FormField
              label="Peso (kg)"
              name="peso"
              error={pesoError}
              hint="Ex: 72.5"
            >
              <input
                id="peso"
                name="peso"
                type="text"
                inputMode="decimal"
                className={`input ${pesoError ? 'input--invalid' : ''}`}
                placeholder="Ex: 72.5"
                value={peso}
                onChange={(e) => {
                  setPeso(e.target.value)
                  if (pesoError) setPesoError(null)
                }}
                aria-invalid={!!pesoError}
              />
            </FormField>
            <FormField label="Data" name="data" hint="Opcional">
              <input
                id="data"
                name="data"
                type="date"
                className="input"
                value={dataRegistro}
                onChange={(e) => setDataRegistro(e.target.value)}
              />
            </FormField>
            <div style={{ minWidth: 120 }}>
              <label className="field-label" style={{ opacity: 0 }} aria-hidden>Ação</label>
              <button type="submit" className="btn btn--primary" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-4)',
        }}>
          Evolução do peso
        </h2>
        {historico.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p className="muted" style={{ margin: 0 }}>
              Nenhum registro ainda. Adicione um peso acima.
            </p>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: 'var(--space-4)',
              minHeight: 260,
            }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="data" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'var(--text)' }}
                  formatter={(value: number) => [value, '']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  name="Peso (kg)"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
