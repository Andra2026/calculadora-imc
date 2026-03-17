# AC1 — Entrega

## Funcionalidade entregue

**Calculadora IMC** — Cadastro de pessoas, registro de peso, cálculo automático de IMC e gráfico de evolução.

### 3 camadas implementadas

| Camada | Tecnologia | Arquivos |
|--------|------------|----------|
| **Front-end** | Next.js 14 + TypeScript + Recharts | `app/`, `components/` |
| **Back-end** | lib (lógica de negócio) + Supabase API | `lib/data.ts`, `lib/supabase.ts`, `lib/validation.ts` |
| **Banco de dados** | PostgreSQL (Supabase) | `supabase/migrations/` |

### Funcionalidades

- Cadastrar, editar e excluir pessoas (nome, idade, altura)
- Registrar, editar e excluir pesagens (peso, data)
- Cálculo automático de IMC via trigger no banco
- Dashboard com indicadores (total de pessoas, média de IMC)
- Gráfico de evolução de peso por pessoa (Recharts)
- Validação no front-end e no banco (constraints)
- Busca/filtro de pessoas

## Checklist da entrega

- [x] **Link do GitHub**: [github.com/Andra2026/calculadora-imc](https://github.com/Andra2026/calculadora-imc)
- [x] **Link do Board**: [github.com/users/Andra2026/projects/3](https://github.com/users/Andra2026/projects/3)
- [x] **3 camadas** (Front-end, Back-end, Banco de dados)
- [x] **Commits organizados** por camada
- [ ] **Deploy Vercel** (configurar variáveis de ambiente)
- [ ] **Vídeo** apresentando a funcionalidade

## Como testar

```bash
npm install
cp .env.local.example .env.local
# Preencha com URL e anon key do Supabase
npm run dev
```
