# Controle Financeiro Pessoal (MVP)

Aplicação web **mobile-first** para organização financeira, com linguagem simples e conexão educativa com proteção financeira.

## Resumo executivo

Este MVP foi desenhado para:
- funcionar como presente para clientes e isca digital;
- reduzir fricção para usuários iniciantes;
- transformar dados básicos em clareza financeira imediata;
- abrir diálogo natural sobre proteção financeira, sem tom comercial agressivo.

## Arquitetura recomendada

- **Backend:** Node.js + Express (API leve)
- **Frontend:** HTML + CSS + JavaScript vanilla
- **Estratégia:** monólito simples com separação clara de responsabilidades

### Camadas
- `server.js`: servidor HTTP, arquivos estáticos e endpoints de API
- `public/index.html`: landing + app em fluxo contínuo
- `public/css/styles.css`: design system leve, responsivo, mobile-first
- `public/js/app.js`: estado da UI, cálculos, indicadores e insights

## Estrutura de pastas

```bash
.
├── package.json
├── server.js
├── README.md
└── public
    ├── index.html
    ├── css
    │   └── styles.css
    └── js
        └── app.js
```

## Fluxo de telas (MVP)

1. **Landing page**
   - Headline forte
   - Benefícios
   - CTA “Começar agora”
2. **Tela principal (mesma página)**
   - Formulário essencial
   - Cards de indicadores em tempo real
   - Insights automáticos
   - Módulo de proteção financeira
3. **Estado inicial**
   - Loading curto + dados mockados
4. **Estado vazio / orientação**
   - Mensagens orientativas quando necessário

## Plano de implementação (executado)

1. Definição de arquitetura e estrutura base
2. Construção da landing page
3. Construção da interface principal (inputs + outputs)
4. Implementação da lógica de cálculo e classificação de saúde financeira
5. Implementação de insights automáticos
6. Implementação do módulo de proteção (seguro sim/não)
7. Documentação e instruções de evolução

## Como rodar localmente

```bash
npm install
npm start
```

Abra: `http://localhost:3000`

## API disponível

- `GET /api/config` → configuração inicial (mock)
- `POST /api/analyze` → retorna cálculos financeiros básicos

## Evolução planejada (próximos passos)

- Ativar **Modo Avançado** em rota/seção dedicada
- Persistência com banco de dados (ex.: PostgreSQL)
- Relatórios comparativos mensais
- Captura de lead (opt-in) com consentimento LGPD
- Conteúdo educativo contextual (microcards)
- Integração opcional com CRM

## Observações de produto

- Não há autenticação nesta versão por decisão de validação de UX.
- O conteúdo evita linguagem alarmista e não promete resultados financeiros.
