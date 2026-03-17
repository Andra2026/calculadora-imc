'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPessoa, deletePessoa, listPessoas, updatePessoa } from '@/lib/data'
import type { PessoaComUltimoPeso } from '@/lib/types'
import FormField from '@/components/FormField'
import { validatePessoaForm } from '@/lib/validation'

export default function PessoasManager() {
  const [pessoas, setPessoas] = useState<PessoaComUltimoPeso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [idade, setIdade] = useState('')
  const [altura, setAltura] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string; idade?: string; altura?: string }>({})
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listPessoas()
      setPessoas(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pessoas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = validatePessoaForm({ nome, idade, altura })
    if (!result.valid) {
      setFieldErrors(result.errors)
      return
    }
    const { parsed } = result
    setFieldErrors({})
    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await updatePessoa(editingId, { nome: parsed.nome, idade: parsed.idade, altura: parsed.altura })
      } else {
        await createPessoa({ nome: parsed.nome, idade: parsed.idade, altura: parsed.altura })
      }
      setNome('')
      setIdade('')
      setAltura('')
      setEditingId(null)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (p: PessoaComUltimoPeso) => {
    setEditingId(p.id)
    setNome(p.nome)
    setIdade(String(p.idade))
    setAltura(String(p.altura))
    setFieldErrors({})
    setError(null)
    setShowForm(true)
  }

  const onDelete = async (id: string) => {
    const confirmed = window.confirm('Deseja excluir esta pessoa? Os registros de peso tambem serao excluidos.')
    if (!confirmed) return
    setError(null)
    try {
      await deletePessoa(id)
      if (editingId === id) {
        setEditingId(null)
        setShowForm(false)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir pessoa')
    }
  }

  const pessoasFiltradas = pessoas.filter((p) => p.nome.toLowerCase().includes(search.trim().toLowerCase()))

  if (loading) {
    return (
      <div className="loading-state">
        <div className="skeleton" style={{ height: 40, width: 200, margin: '0 auto' }} />
        <p className="muted" style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          Carregando...
        </p>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-header__title">Pessoas</h1>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setShowForm((v) => !v)
            if (showForm) {
              setEditingId(null)
              setNome('')
              setIdade('')
              setAltura('')
            }
            setFieldErrors({})
            setError(null)
          }}
        >
          {showForm ? 'Cancelar' : '+ Nova pessoa'}
        </button>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="form-row">
          <FormField label="Buscar pessoa" name="busca" hint="Filtra por nome">
            <input
              id="busca"
              className="input"
              placeholder="Ex: Maria"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FormField>
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', minWidth: 160 }}>
            <p className="muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Total filtrado</p>
            <p style={{ margin: 'var(--space-1) 0 0', fontWeight: 700, fontSize: '1.35rem' }}>{pessoasFiltradas.length}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-block">
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
            {editingId ? 'Editar pessoa' : 'Nova pessoa'}
          </h2>
          <div className="form-row">
            <FormField label="Nome" name="nome" error={fieldErrors.nome}>
              <input
                id="nome"
                name="nome"
                type="text"
                className={`input ${fieldErrors.nome ? 'input--invalid' : ''}`}
                placeholder="Ex: Maria Silva"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (fieldErrors.nome) setFieldErrors((prev) => ({ ...prev, nome: undefined }))
                }}
                aria-invalid={!!fieldErrors.nome}
                autoComplete="name"
              />
            </FormField>
            <FormField label="Idade" name="idade" error={fieldErrors.idade} hint="1 a 150">
              <input
                id="idade"
                name="idade"
                type="number"
                min={1}
                max={150}
                className={`input ${fieldErrors.idade ? 'input--invalid' : ''}`}
                placeholder="Ex: 30"
                value={idade}
                onChange={(e) => {
                  setIdade(e.target.value)
                  if (fieldErrors.idade) setFieldErrors((prev) => ({ ...prev, idade: undefined }))
                }}
                aria-invalid={!!fieldErrors.idade}
              />
            </FormField>
            <FormField label="Altura (m)" name="altura" error={fieldErrors.altura} hint="Ex: 1.75">
              <input
                id="altura"
                name="altura"
                type="text"
                inputMode="decimal"
                className={`input ${fieldErrors.altura ? 'input--invalid' : ''}`}
                placeholder="Ex: 1.75"
                value={altura}
                onChange={(e) => {
                  setAltura(e.target.value)
                  if (fieldErrors.altura) setFieldErrors((prev) => ({ ...prev, altura: undefined }))
                }}
                aria-invalid={!!fieldErrors.altura}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Salvando...' : editingId ? 'Salvar alteracoes' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      {pessoasFiltradas.length === 0 && !showForm ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <p className="muted" style={{ margin: 0, fontSize: 'var(--text-lg)' }}>
            Nenhuma pessoa cadastrada.
          </p>
          <p className="muted" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            Clique em &quot;+ Nova pessoa&quot; para comecar.
          </p>
          <button type="button" className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setShowForm(true)}>
            + Nova pessoa
          </button>
        </div>
      ) : (
        <ul className="grid grid--2">
          {pessoasFiltradas.map((p) => (
            <li key={p.id}>
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <Link href={`/pessoa/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }} aria-label={`Ver detalhes de ${p.nome}`}>
                  <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)' }}>{p.nome}</span>
                </Link>
                <p className="muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)' }}>
                  {p.idade} anos · {p.altura} m
                  {p.ultimo_peso != null && <> · Ultimo peso: <strong style={{ color: 'var(--text)' }}>{p.ultimo_peso} kg</strong></>}
                  {p.ultimo_imc != null && <> · IMC: <strong style={{ color: 'var(--text)' }}>{p.ultimo_imc}</strong></>}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <Link href={`/pessoa/${p.id}`} className="btn btn--secondary">
                    Detalhes
                  </Link>
                  <button type="button" className="btn btn--secondary" onClick={() => startEdit(p)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--danger" onClick={() => onDelete(p.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
