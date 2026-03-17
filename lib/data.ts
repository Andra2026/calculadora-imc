/**
 * Camada de dados (lógica de negócio + acesso ao banco)
 *
 * Todas as operações de leitura e escrita passam por aqui.
 * Utiliza o cliente Supabase (lib/supabase.ts) para falar com o PostgreSQL.
 * O IMC é calculado no banco via trigger (ver supabase/migrations).
 */

import { createClient } from '@/lib/supabase'
import type {
  EvolucaoPeso,
  PesagemComPessoa,
  PessoaComUltimoPeso,
  PessoaCreate,
  PessoaUpdate,
  RegistroPesoCreate,
  RegistroPesoRow,
  RegistroPesoUpdate,
} from '@/lib/types'

const DB_TIMEOUT_MS = 8000

function mapDbErrorMessage(message: string) {
  const msg = message.toLowerCase()
  if (msg.includes('duplicate key')) return 'Registro duplicado. Revise os dados informados.'
  if (msg.includes('foreign key')) return 'Relacionamento invalido. Verifique a pessoa selecionada.'
  if (msg.includes('check constraint')) return 'Dados invalidos para as regras do sistema.'
  if (msg.includes('violates')) return 'Operacao invalida conforme as regras do banco.'
  return message
}

function makeDbError(error: { message?: string } | null) {
  return new Error(mapDbErrorMessage(error?.message ?? 'Erro no banco de dados'))
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = DB_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  // Evita requisições presas indefinidamente quando há falha de rede/credencial.
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Tempo limite excedido ao consultar o banco. Verifique sua conexao e variaveis do Supabase.'))
    }, timeoutMs)
  })
  try {
    return await Promise.race([Promise.resolve(promise), timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Lista todas as pessoas cadastradas com o último peso e IMC de cada uma.
 * Usado na página inicial (listagem).
 */
export async function listPessoas(): Promise<PessoaComUltimoPeso[]> {
  const supabase = createClient()
  const { data: pessoas, error } = await withTimeout(supabase
    .from('pessoas')
    .select('id, nome, idade, altura, created_at')
    .order('id'))

  if (error) throw makeDbError(error)
  if (!pessoas?.length) return []

  const result: PessoaComUltimoPeso[] = []
  // Para cada pessoa, busca somente o ultimo registro de peso (mais recente).
  for (const p of pessoas) {
    const { data: registros } = await withTimeout(supabase
      .from('registros_peso')
      .select('peso, imc, data')
      .eq('pessoa_id', p.id)
      .order('data', { ascending: false })
      .limit(1))
    const ultimo = registros?.[0] ?? null
    result.push({
      ...p,
      ultimo_peso: ultimo?.peso ?? null,
      ultimo_imc: ultimo?.imc ?? null,
      data_ultimo_peso: ultimo?.data ?? null,
    })
  }
  return result
}

/**
 * Busca uma pessoa pelo ID e enriquece com último peso/IMC.
 * Usado na página de detalhe (/pessoa/[id]).
 */
export async function getPessoa(id: string): Promise<PessoaComUltimoPeso | null> {
  const supabase = createClient()
  const { data: pessoa, error } = await withTimeout(supabase
    .from('pessoas')
    .select('id, nome, idade, altura, created_at')
    .eq('id', id)
    .single())

  if (error || !pessoa) return null

  const { data: registros } = await withTimeout(supabase
    .from('registros_peso')
    .select('peso, imc, data')
    .eq('pessoa_id', id)
    .order('data', { ascending: false })
    .limit(1))
  const ultimo = registros?.[0] ?? null

  return {
    ...pessoa,
    ultimo_peso: ultimo?.peso ?? null,
    ultimo_imc: ultimo?.imc ?? null,
    data_ultimo_peso: ultimo?.data ?? null,
  }
}

/**
 * Cria uma nova pessoa no banco (cadastro).
 * Campos validados no front e no schema (check constraints no SQL).
 */
export async function createPessoa(data: PessoaCreate) {
  const supabase = createClient()
  const { data: row, error } = await withTimeout(supabase
    .from('pessoas')
    .insert({ nome: data.nome, idade: data.idade, altura: data.altura })
    .select('id, nome, idade, altura, created_at')
    .single())
  if (error) throw makeDbError(error)
  return row
}

export async function updatePessoa(id: string, data: PessoaUpdate) {
  const supabase = createClient()
  const { data: row, error } = await withTimeout(
    supabase
      .from('pessoas')
      .update({ nome: data.nome, idade: data.idade, altura: data.altura })
      .eq('id', id)
      .select('id, nome, idade, altura, created_at')
      .single(),
  )
  if (error) throw makeDbError(error)
  return row
}

export async function deletePessoa(id: string) {
  const supabase = createClient()
  const { error } = await withTimeout(supabase.from('pessoas').delete().eq('id', id))
  if (error) throw makeDbError(error)
}

/**
 * Retorna o histórico de pesos de uma pessoa (ordenado por data).
 * Usado para montar o gráfico de evolução na página de detalhe.
 */
export async function getHistoricoPeso(pessoaId: string): Promise<EvolucaoPeso[]> {
  const supabase = createClient()
  const { data, error } = await withTimeout(supabase
    .from('registros_peso')
    .select('data, peso, imc')
    .eq('pessoa_id', pessoaId)
    .order('data', { ascending: true }))

  if (error) throw makeDbError(error)
  return (data ?? []).map((r) => ({
    data: r.data,
    peso: r.peso,
    imc: r.imc ?? null,
  }))
}

/**
 * Registra um novo peso para uma pessoa.
 * O IMC é calculado automaticamente pelo trigger no banco (calcular_imc_registro).
 * data opcional: se não informada, usa current_date no banco.
 */
export async function registrarPeso(pessoaId: string, peso: number, data?: string) {
  const supabase = createClient()
  // Quando data nao vem, o banco usa current_date automaticamente.
  const body = data ? { pessoa_id: pessoaId, peso, data } : { pessoa_id: pessoaId, peso }
  const { data: row, error } = await withTimeout(supabase
    .from('registros_peso')
    .insert(body)
    .select('id, pessoa_id, peso, data, imc')
    .single())
  if (error) throw makeDbError(error)
  return row
}

export async function createRegistroPeso(payload: RegistroPesoCreate) {
  return registrarPeso(payload.pessoa_id, payload.peso, payload.data)
}

export async function updateRegistroPeso(id: string, payload: RegistroPesoUpdate) {
  const supabase = createClient()
  const body = payload.data ? { peso: payload.peso, data: payload.data } : { peso: payload.peso }
  const { data: row, error } = await withTimeout(
    supabase
      .from('registros_peso')
      .update(body)
      .eq('id', id)
      .select('id, pessoa_id, peso, data, imc, created_at')
      .single(),
  )
  if (error) throw makeDbError(error)
  return row as RegistroPesoRow
}

export async function deleteRegistroPeso(id: string) {
  const supabase = createClient()
  const { error } = await withTimeout(supabase.from('registros_peso').delete().eq('id', id))
  if (error) throw makeDbError(error)
}

export async function listPessoasBasicas() {
  const supabase = createClient()
  const { data, error } = await withTimeout(
    supabase.from('pessoas').select('id, nome').order('nome', { ascending: true }),
  )
  if (error) throw makeDbError(error)
  return data ?? []
}

export async function listPesagens(): Promise<PesagemComPessoa[]> {
  const supabase = createClient()
  const { data: registros, error } = await withTimeout(
    supabase
      .from('registros_peso')
      .select('id, pessoa_id, peso, data, imc, created_at')
      .order('data', { ascending: false }),
  )
  if (error) throw makeDbError(error)
  if (!registros?.length) return []

  // Deduplica IDs para evitar filtro "in" com repeticoes desnecessarias.
  const pessoaIds = Array.from(new Set(registros.map((r) => r.pessoa_id)))
  const { data: pessoas, error: pessoasError } = await withTimeout(
    supabase.from('pessoas').select('id, nome').in('id', pessoaIds),
  )
  if (pessoasError) throw new Error(pessoasError.message)
  const nomeById = new Map((pessoas ?? []).map((p) => [p.id as string, p.nome as string]))

  return registros.map((r) => ({
    ...(r as RegistroPesoRow),
    pessoa_nome: nomeById.get(r.pessoa_id as string) ?? 'Pessoa removida',
  }))
}

export async function getDashboardResumo() {
  const pessoas = await listPessoas()
  const comPeso = pessoas.filter((p) => p.ultimo_peso != null)
  // Media de IMC considera apenas pessoas com pesagem registrada.
  const mediaImc =
    comPeso.length === 0
      ? null
      : Number((comPeso.reduce((acc, p) => acc + (p.ultimo_imc ?? 0), 0) / comPeso.length).toFixed(2))
  return {
    totalPessoas: pessoas.length,
    comPeso: comPeso.length,
    semPeso: pessoas.length - comPeso.length,
    mediaImc,
    recentes: pessoas.slice(0, 5),
  }
}
