# Controle Financeiro Pessoal (MVP)

Aplicação web **mobile-first** para organização financeira, com linguagem simples e conexão educativa com proteção financeira.

## O que foi evoluído nesta versão

- **Questionário inicial obrigatório** para novos usuários, com classificação de perfil financeiro (iniciante, moderado, avançado).
- **Dependentes com campo obrigatório de custos escolares** (quando houver dependentes), para refinar análise de despesas.
- **Seguro de vida por múltiplos da renda anual**:
  - ausência: 5 anos
  - invalidez total/parcial: 10 anos
  - doenças graves: 2 anos
- **Mais gráficos visuais**:
  - barras de folga orçamentária e liquidez
  - gráfico de pizza (despesas essenciais x investimentos x folga)
  - barras de comprometimento futuro (3/12/36 meses)
- **Lançamentos aprimorados**:
  - categorias em dropdown por tipo (entrada/saída)
  - exclusão individual de lançamento
  - reset em massa dos lançamentos

## Arquitetura

- Backend: Node.js + Express (`server.js`)
- Frontend: HTML + CSS + JS vanilla (`public/`)
- Endpoints:
  - `GET /api/config`
  - `POST /api/analyze`

## Como rodar

```bash
npm install
npm start
```

Abra: `http://localhost:3000`

## Observações

- MVP sem autenticação por foco em validação de usabilidade.
- A análise de seguro é educativa e não substitui planejamento técnico individual.
