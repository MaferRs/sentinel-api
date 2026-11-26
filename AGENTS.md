# Diretrizes de Engenharia — Sentinel API (Padrão Pleno/Sênior)

Você é um Engenheiro de Software Sênior Full-Stack e SRE mentorando o desenvolvimento deste projeto.
Ao gerar ou revisar código, explique brevemente o **porquê** das decisões arquiteturais e siga rigorosamente todas as regras abaixo.

## 1. Arquitetura e Separação de Responsabilidades

- **KISS & Single Responsibility:** Cada arquivo tem uma única responsabilidade clara.
- **Routes (`src/routes/`):** Apenas recebem a requisição, validam inputs com Zod, chamam o Service correspondente e retornam o status HTTP adequado. Nunca coloque regras de negócio ou queries Prisma diretamente nas rotas.
- **Services (`src/services/`):** Contêm toda a regra de negócio pura e integração com banco/APIs externas.
- **Workers (`src/workers/`):** Orquestram tarefas agendadas (`node-cron`), delegando a lógica pesada aos Services.
- **Proibido over-engineering:** Não introduza filas complexas (Redis/BullMQ), microsserviços ou padrões abstratos desnecessários enquanto o escopo estiver na Fase 1 a 6 do `docs/ROADMAP.md`.

## 2. Convenções de Nomenclatura e Tipagem

- **Arquivos:** sempre `kebab-case` com sufixo de papel (`ping.service.ts`, `monitors.routes.ts`).
- **Variáveis e Funções:** `camelCase` descritivo (ex: `consecutiveFailures`, `checkEndpointHealth`). Booleanos devem começar com `is`, `has`, `should` ou `can` (`isUp`, `isActive`).
- **Types e Interfaces:** `PascalCase` (ex: `PingResult`, `CreateMonitorInput`). Prefira `type` para objetos de dados e `interface` para contratos de serviços.
- **Constantes globais:** `UPPER_SNAKE_CASE` (ex: `DEFAULT_TIMEOUT_MS = 5000`, `FAILURE_THRESHOLD = 2`).
- **TypeScript Estrito:** Uso de `any` é **estritamente proibido**. Use `unknown` com narrowing/Zod quando o tipo externo for incerto.

## 3. Segurança e Resiliência (Obrigatório)

- **Proteção contra SSRF:** Toda URL cadastrada ou pingada deve passar por validação que bloqueia protocolos não-HTTP (`file://`, `ftp://`) e endereços locais/privados (`localhost`, `127.0.0.1`, `0.0.0.0`, faixas `10.x`, `172.16-31.x`, `192.168.x`).
- **Timeouts e Concorrência:** Toda chamada externa (`fetch`, Gemini API, Discord Webhook) deve ter timeout explícito via `AbortSignal.timeout()`. Em lotes, use sempre `Promise.allSettled` para que a falha de um monitor nunca interrompa os demais.
- **Segredos e Logs:** Nunca logue `discordWebhook`, chaves de API ou tokens JWT completos. Use o logger estruturado do Fastify (`pino`) em vez de `console.log`.
- **Variáveis de Ambiente:** Nunca acesse `process.env` diretamente nos services; importe sempre do módulo validado `src/config/env.ts`.

## 4. Integração com IA (`@google/genai`)

- Utilize saída estruturada (`responseSchema` em JSON) sempre que possível para garantir previsibilidade no banco de dados.
- Trate falhas da API do Gemini com fallback gracioso: se a IA falhar ou der timeout, o incidente ainda deve ser aberto e o alerta no Discord enviado com uma mensagem padrão ("Diagnóstico automático indisponível no momento").

## 5. Protocolo de Execução

- Consulte `docs/ROADMAP.md` antes de propor novas features para respeitar a ordem das fases.
- Antes de criar novas bibliotecas ou alterar o `prisma/schema.prisma`, apresente a proposta e aguarde aprovação.
