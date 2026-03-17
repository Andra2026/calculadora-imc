-- =============================================================================
-- FitTrack — Migração 2: Trigger de cálculo de IMC (Banco de dados - Camada 3)
-- =============================================================================
-- Executar APÓS 20240316000000_create_tables.sql.
-- Ao inserir ou atualizar um registro em registros_peso, o trigger busca a altura
-- da pessoa e preenche a coluna imc (peso / altura², arredondado).
-- =============================================================================

create or replace function public.calcular_imc_registro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_altura real;
begin
  select altura into v_altura from public.pessoas where id = new.pessoa_id;
  if v_altura is null or v_altura <= 0 then
    new.imc := null;
    return new;
  end if;
  new.imc := round((new.peso / (v_altura * v_altura))::numeric, 2);
  return new;
end;
$$;

drop trigger if exists trigger_calcular_imc on public.registros_peso;
create trigger trigger_calcular_imc
  before insert or update of peso, pessoa_id
  on public.registros_peso
  for each row
  execute function public.calcular_imc_registro();
