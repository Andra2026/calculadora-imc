-- =============================================================================
-- FitTrack — Migração 1: Criação das tabelas (Banco de dados - Camada 3)
-- =============================================================================
-- Executar no SQL Editor do projeto Supabase, na ordem dos arquivos:
--   1) 20240316000000_create_tables.sql  (este arquivo)
--   2) 20240316000001_trigger_imc.sql
--
-- Tabelas: pessoas (cadastro) e registros_peso (peso por data; IMC calculado por trigger).
-- RLS habilitado com políticas permissivas para uso sem login; ajustar com auth.uid() quando houver autenticação.
-- =============================================================================

-- Tabela de pessoas (nome, idade em anos, altura em metros)
create table if not exists public.pessoas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  idade int not null check (idade >= 1 and idade <= 150),
  altura real not null check (altura > 0),
  created_at timestamptz default now()
);

-- Tabela de registros de peso (um registro por pessoa por data; IMC preenchido por trigger)
create table if not exists public.registros_peso (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  peso real not null check (peso > 0),
  data date not null default current_date,
  imc real,
  created_at timestamptz default now()
);

-- Índices para consultas por pessoa e por data
create index if not exists idx_registros_peso_pessoa_id on public.registros_peso(pessoa_id);
create index if not exists idx_registros_peso_data on public.registros_peso(data);

-- Row Level Security (RLS): habilitado; políticas liberam tudo para anon (single-user)
alter table public.pessoas enable row level security;
alter table public.registros_peso enable row level security;

create policy "Allow all for pessoas" on public.pessoas for all using (true) with check (true);
create policy "Allow all for registros_peso" on public.registros_peso for all using (true) with check (true);

-- Comentários no catálogo do PostgreSQL (documentação)
comment on table public.pessoas is 'Cadastro de pessoas (nome, idade, altura em metros)';
comment on table public.registros_peso is 'Registros de peso com IMC calculado por trigger';
comment on column public.registros_peso.imc is 'IMC = peso / (altura * altura), arredondado; preenchido pelo trigger_calcular_imc';
