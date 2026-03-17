/**
 * Cliente Supabase — Camada de acesso ao banco de dados
 *
 * Projeto de Software (3 camadas): Front-end (Next.js) | Back-end (lib/data + Supabase API) | Banco (PostgreSQL/Supabase)
 *
 * Este arquivo configura o cliente que conecta a aplicação ao PostgreSQL hospedado no Supabase.
 * As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 * devem estar definidas em .env.local (veja .env.local.example).
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

/** Cliente singleton para evitar múltiplas instâncias na mesma sessão */
let client: SupabaseClient | null = null

/**
 * Cria ou retorna o cliente Supabase já existente.
 * Garante uma única instância (singleton) para toda a aplicação.
 */
export function createClient() {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  client = createSupabaseClient(url, key)
  return client
}
