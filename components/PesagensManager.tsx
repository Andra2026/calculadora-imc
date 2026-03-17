'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  createRegistroPeso,
  deleteRegistroPeso,
  listPesagens,
  listPessoasBasicas,
  updateRegistroPeso,
} from '@/lib/data'
import type { PesagemComPessoa } from '@/lib/types'
import FormField from '@/components/FormField'
import { validatePesoForm } from '@/lib/validation'

export default function PesagensManager() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<PesagemComPessoa[]>([])
  const [pessoas, setPessoas] = useState<Array<{ id: string; nome: string }>>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pessoaId, setPessoaId] = useState('')
  const [peso, setPeso] = useState('')
  const [data, setData] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [filterPessoaId, setFilterPessoaId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const pessoaNomeById = useMemo(
    () => new Map(pessoas.map((p) => [p.id, p.nome])),
    [pessoas],
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [allRecords, allPessoas] = await Promise.all([listPesagens(), listPessoasBasicas()])
      setRecords(allRecords)
      setPessoas(allPessoas as Array<{ id: string; nome: string }>)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pesagens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setPessoaId('')
    setPeso('')
    setData('')
    setFieldError(null)
  }

  const startEdit = (record: PesagemComPessoa) => {
    setEditingId(record.id)
    setPessoaId(record.pessoa_id)
    setPeso(String(record.peso))
    setData(record.data)
    setFieldError(null)
    setShowForm(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pessoaId) {
      setFieldError('Selecione a pessoa.')
      return
    }
    const result = validatePesoForm(peso, data)
    if (!result.valid || result.parsedPeso == null) {
      setFieldError(result.error)
      return
    }
    const parsedPeso = result.parsedPeso
    setFieldError(null)
    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await updateRegistroPeso(editingId, { peso: parsedPeso, data: data || undefined })
      } else {
        await createRegistroPeso({ pessoa_id: pessoaId, peso: parsedPeso, data: data || undefined })
      }
      resetForm()
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pesagem')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta pesagem?')) return
    setError(null)
    try {
      await deleteRegistroPeso(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir pesagem')
    }
  }

  const filteredRecords = records.filter((r) => {
    const matchPessoa = !filterPessoaId || r.pessoa_id === filterPessoaId
    const matchDate = !filterDate || r.data === filterDate
    return matchPessoa && matchDate
  })

  if (loading) {
    return (
      <div className="loading-state">
        <div className="skeleton" style={{ height: 40, width: 220 }} />
        <div className="skeleton" style={{ height: 80, marginTop: 'var(--space-4)' }} />
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-header__title">Pesagens</h1>
        <button
          className="btn btn--secondary"
          onClick={() => {
            setShowForm((v) => !v)
            if (showForm) resetForm()
          }}
        >
          {showForm ? 'Cancelar' : '+ Nova pesagem'}
        </button>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="form-row">
          <FormField label="Filtrar por pessoa" name="filter-pessoa">
            <select
              id="filter-pessoa"
              className="input"
              value={filterPessoaId}
              onChange={(e) => setFilterPessoaId(e.target.value)}
            >
              <option value="">Todas</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Filtrar por data" name="filter-data">
            <input
              id="filter-data"
              type="date"
              className="input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </FormField>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setFilterPessoaId('')
              setFilterDate('')
            }}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="form-block">
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>
            {editingId ? 'Editar pesagem' : 'Nova pesagem'}
          </h2>
          <div className="form-row">
            <FormField label="Pessoa" name="pessoa">
              <select
                id="pessoa"
                className="input"
                value={pessoaId}
                onChange={(e) => setPessoaId(e.target.value)}
                disabled={!!editingId}
              >
                <option value="">Selecione</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Peso (kg)" name="peso" hint="Ex: 72.5">
              <input
                id="peso"
                className={`input ${fieldError ? 'input--invalid' : ''}`}
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 72.5"
              />
            </FormField>
            <FormField label="Data" name="data" hint="Opcional">
              <input
                id="data"
                type="date"
                className="input"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </FormField>
          </div>
          {fieldError && <p className="field-error" style={{ margin: 0 }}>{fieldError}</p>}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Salvando...' : editingId ? 'Salvar alteracoes' : 'Salvar pesagem'}
            </button>
          </div>
        </form>
      )}

      {!filteredRecords.length ? (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <p className="muted" style={{ margin: 0 }}>Nenhuma pesagem para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Peso (kg)</th>
                <th>Data</th>
                <th>IMC</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>{pessoaNomeById.get(r.pessoa_id) ?? r.pessoa_nome}</td>
                  <td>{r.peso}</td>
                  <td>{r.data}</td>
                  <td>{r.imc ?? '--'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn--secondary" onClick={() => startEdit(r)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn--danger" onClick={() => onDelete(r.id)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
