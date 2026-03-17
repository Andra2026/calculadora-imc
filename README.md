# Calculadora IMC

Sistema de controle de peso com cadastro de pessoas, registro de peso, cálculo de IMC e gráfico de evolução.

**Repositório:** [github.com/Andra2026/calculadora-imc](https://github.com/Andra2026/calculadora-imc)

---

## Projeto de Software — 3 camadas

| Camada | Tecnologia | Onde no projeto |
|--------|------------|------------------|
| **Front-end** | Next.js (App Router) + TypeScript + Recharts | `app/`, `components/`, `app/globals.css` |
| **Back-end** | Lógica em Node (lib) + API Supabase | `lib/data.ts`, `lib/supabase.ts`, `lib/validation.ts` |
| **Banco de dados** | PostgreSQL (Supabase) | `supabase/migrations/` — tabelas, trigger de IMC e regras |

---

## Stack

- **Next.js 14** (App Router) + TypeScript — frontend e aplicação única
- **Supabase** — banco PostgreSQL (tabelas `pessoas`, `registros_peso`) e trigger de IMC
- **Recharts** — gráfico de evolução do peso

---

## Estrutura

```
calculadora-imc/
├── app/                        # Next.js App Router (frontend)
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard
│   ├── globals.css
│   ├── pessoas/page.tsx        # CRUD de pessoas
│   ├── pesagens/page.tsx       # CRUD de pesagens
│   └── pessoa/[id]/page.tsx    # Detalhe + gráfico + registrar peso
├── components/                  # Layout, sidebar e managers (CRUD)
├── lib/
│   ├── supabase.ts             # Cliente Supabase (conexão)
│   ├── types.ts                # Tipos (Pessoa, RegistroPeso, etc.)
│   ├── data.ts                 # Lógica de dados (listar/criar pessoas, peso, IMC)
│   └── validation.ts           # Validações do front-end
├── supabase/migrations/         # Schema, trigger IMC e regras de validação
├── .env.local.example           # Template de variáveis de ambiente
├── _legacy/                     # Referência (não usado na stack atual)
└── frontend/                    # Legado Vite/React (referência)
```

---

## Como rodar

### 1. Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor, execute os arquivos de `supabase/migrations/` na ordem.
3. Em **Settings > API**, copie a **Project URL** e a **anon public** key.

### 2. App Next.js

```bash
npm install
cp .env.local.example .env.local
# Edite .env.local com URL e anon key do Supabase

npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Rotas

- `/` — Dashboard gerencial
- `/pessoas` — CRUD completo de pessoas
- `/pesagens` — CRUD completo de pesagens
- `/pessoa/[id]` — Detalhes da pessoa + gráfico de evolução

---

## Deploy (Vercel)

1. Acesse [vercel.com](https://vercel.com) e conecte ao GitHub.
2. Importe o repositório `calculadora-imc`.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático a cada push em `main`.

---

## Board (GitHub Projects)

O quadro de tarefas do projeto está em:
[github.com/users/Andra2026/projects/3](https://github.com/users/Andra2026/projects/3)

---

## Entrega AC1

Detalhes e checklist em **AC1_ENTREGA.md**.
