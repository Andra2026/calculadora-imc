/**
 * Tipos TypeScript — Camada de dados
 *
 * Interfaces alinhadas ao schema do banco Supabase (PostgreSQL).
 * IDs são strings UUID retornadas pelo banco.
 */

/** Dados necessários para criar uma nova pessoa no cadastro */
export interface PessoaCreate {
  nome: string
  idade: number
  altura: number
}

export interface PessoaUpdate extends PessoaCreate {}

/** Linha da tabela pessoas (como retornada do banco) */
export interface PessoaRow {
  id: string
  nome: string
  idade: number
  altura: number
  created_at: string | null
}

/** Linha da tabela registros_peso (peso, data, IMC calculado pelo trigger) */
export interface RegistroPesoRow {
  id: string
  pessoa_id: string
  peso: number
  data: string
  imc: number | null
  created_at?: string | null
}

export interface RegistroPesoCreate {
  pessoa_id: string
  peso: number
  data?: string
}

export interface RegistroPesoUpdate {
  peso: number
  data?: string
}

/** Pessoa com último peso e IMC (usado na listagem e na tela de detalhe) */
export interface PessoaComUltimoPeso extends PessoaRow {
  ultimo_peso: number | null
  ultimo_imc: number | null
  data_ultimo_peso: string | null
}

/** Um ponto da evolução do peso (para o gráfico de linha) */
export interface EvolucaoPeso {
  data: string
  peso: number
  imc: number | null
}

export interface PesagemComPessoa extends RegistroPesoRow {
  pessoa_nome: string
}
