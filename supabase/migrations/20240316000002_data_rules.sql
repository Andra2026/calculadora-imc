-- Regras de validacao adicionais no banco (camada de dados)
-- Execute apos as migracoes 00000 e 00001

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pessoas_nome_len_check'
  ) then
    alter table public.pessoas
      add constraint pessoas_nome_len_check check (char_length(trim(nome)) between 2 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'pessoas_altura_range_check'
  ) then
    alter table public.pessoas
      add constraint pessoas_altura_range_check check (altura >= 0.5 and altura <= 2.5);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'registros_peso_range_check'
  ) then
    alter table public.registros_peso
      add constraint registros_peso_range_check check (peso >= 20 and peso <= 400);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'registros_data_not_future_check'
  ) then
    alter table public.registros_peso
      add constraint registros_data_not_future_check check (data <= current_date);
  end if;
end $$;

create unique index if not exists idx_registros_peso_unique_pessoa_data
  on public.registros_peso(pessoa_id, data);

create or replace function public.normalizar_nome_pessoa()
returns trigger
language plpgsql
as $$
begin
  new.nome := trim(regexp_replace(new.nome, '\s+', ' ', 'g'));
  return new;
end;
$$;

drop trigger if exists trigger_normalizar_nome_pessoa on public.pessoas;
create trigger trigger_normalizar_nome_pessoa
before insert or update of nome
on public.pessoas
for each row
execute function public.normalizar_nome_pessoa();
