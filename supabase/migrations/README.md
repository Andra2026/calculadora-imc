# Migrações do banco de dados (FitTrack)

Scripts SQL para criar e evoluir o schema do PostgreSQL no Supabase.  
**Ordem de execução:** execute no **SQL Editor** do projeto Supabase na ordem numérica do nome do arquivo.

| Ordem | Arquivo | Descrição |
|-------|---------|-----------|
| 1 | `20240316000000_create_tables.sql` | Cria as tabelas `pessoas` e `registros_peso`, índices e RLS |
| 2 | `20240316000001_trigger_imc.sql` | Cria a função e o trigger que calculam o IMC ao inserir/atualizar peso |
| 3 | `20240316000002_data_rules.sql` | Adiciona regras de validação (checks, índice único pessoa+data e normalização de nome) |

Após executar os scripts, o banco estará pronto para a aplicação Next.js (variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local`).
