# Controle Financeiro Pessoal (MVP)

Aplicação web **mobile-first** para organização financeira, com linguagem simples e conexão educativa com proteção financeira.

## Resumo executivo

Este MVP foi desenhado para:
- funcionar como presente para clientes e isca digital;
- reduzir fricção para usuários iniciantes;
- transformar dados básicos em clareza financeira imediata;
- permitir registro de entradas/saídas por categoria para simular impactos financeiros no curto, médio e longo prazo;
- oferecer pré-análise visual de seguro de vida para ausência, invalidez e doença grave;
- abrir diálogo natural sobre proteção financeira, sem tom comercial agressivo.

## Arquitetura recomendada

- **Backend:** Node.js + Express (API leve)
- **Frontend:** HTML + CSS + JavaScript vanilla
- **Estratégia:** monólito simples com separação clara de responsabilidades

### Camadas
- `server.js`: servidor HTTP, arquivos estáticos e endpoints de API
- `public/index.html`: landing + app com abas (visão geral e lançamentos)
- `public/css/styles.css`: visual premium com estética glass + gradientes quentes
- `public/js/app.js`: estado da UI, cálculos, indicadores, insights e projeções

## Fluxo de telas (MVP)

1. **Landing page**
2. **Aba: Visão Geral**
   - formulário essencial
   - saúde financeira + medidor de folga orçamentária
   - insights automáticos
   - módulo de proteção
   - pré-análise visual de seguro de vida
3. **Aba: Entradas & Saídas**
   - cadastro de movimentações com tipo e categoria (dropdown)
   - lista de lançamentos
   - projeção no curto/médio/longo prazo

## Como rodar localmente

```bash
npm install
npm start
```

Abra: `http://localhost:3000`

## API disponível

- `GET /api/config` → configuração inicial (mock)
- `POST /api/analyze` → retorna cálculos financeiros básicos

## Observações de produto

- Não há autenticação nesta versão por decisão de validação de UX.
- O conteúdo evita linguagem alarmista e não promete resultados financeiros.
- A pré-análise de seguro é **educativa** e não substitui análise técnica individual.
