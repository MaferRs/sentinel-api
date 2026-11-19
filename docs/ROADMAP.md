1. O Contexto do Produto (Para seu README e Portfólio)
   Nome Sugerido: PulseWatch / Sentinel / Vigil (escolha o que soar melhor para você).

A História (O Problema): Desenvolvedores frequentemente hospedam projetos pessoais, APIs e freelas em serviços gratuitos ou de baixo custo (Vercel, Render, Railway). Quando uma aplicação sofre um erro de memória, o banco de dados hiberna ou um deploy quebra em produção, o desenvolvedor geralmente só descobre horas ou dias depois, quando tenta acessar ou quando um cliente reclama.

A Solução: Uma plataforma de monitoramento contínuo onde o usuário cadastra endpoints (URLs) e recebe alertas automáticos caso fiquem fora do ar. Diferente de monitores tradicionais que apenas gritam "Erro 502", o sistema utiliza IA para ler os cabeçalhos e logs técnicos da falha e traduzir o problema para um diagnóstico claro e acionável em linguagem humana.

2. Stack Tecnológica (Focada em Aprendizado Real)
   Escolhi ferramentas que aproveitam seu conhecimento em TypeScript/JavaScript, mantendo o ecossistema moderno, leve e muito valorizado no mercado:

Back-end: Node.js + TypeScript + Fastify (o Fastify é mais rápido que o Express, já vem preparado para TypeScript e tem validação nativa excelente).

Banco de Dados & ORM: PostgreSQL (rodando via Docker localmente e no Supabase ou Neon em produção) + Prisma ORM ou Drizzle ORM (ótimos para você aprender modelagem relacional sem sofrer com SQL puro no início).

Agendamento (Cron): node-cron (para a versão 1, é mais simples que configurar Redis/BullMQ e ensina perfeitamente como funciona um worker em segundo plano).

Integração de IA: Google Gemini API (gemini-2.5-flash) via SDK oficial @google/genai (tem camada gratuita generosa, é extremamente rápido e suporta saída estruturada em JSON).

Notificações: Webhooks do Discord (é literalmente fazer um fetch com método POST enviando um JSON para uma URL do Discord — zero burocracia de configurar servidor de e-mail SMTP).

Front-end: React + TypeScript + Tailwind CSS (sua zona de conforto, onde você vai brilhar na Status Page).

3. O que você vai aprender na prática no Back-end
   Ao concluir este projeto, você terá dominado conceitos que diferenciam um dev júnior de alguém pronto para desafios reais:

Ciclo de Vida HTTP Profundo: Entender além do fetch básico — manipular status codes, headers, AbortController (timeouts) e medir latência com performance.now().

Processamento em Background (Workers): Entender que um servidor back-end não serve apenas para responder requisições de botões clicados na tela; ele executa tarefas autônomas no tempo.

Concorrência Assíncrona: Usar Promise.allSettled para disparar várias verificações simultaneamente sem que uma URL quebrada trave o resto da fila.

Regras de Negócio e Estado: Criar uma lógica inteligente de "tolerância a falhas" (abrir incidente só após 2 erros seguidos) para evitar falsos positivos.

Agregação de Dados: Transformar milhares de linhas de logs em um resumo limpo de 30 dias para o front-end consumir sem travar o navegador.

4. Roteiro de Execução (Passo a Passo)
   Siga exatamente esta ordem. Só avance para a próxima fase quando a anterior estiver funcionando e testada.

Fase 1: Fundação e Banco de Dados
Objetivo: Ter o servidor rodando e salvando dados no banco.

[x] 1.1 Setup do Projeto: Criar a estrutura de pastas (ex: /server e /web), iniciar o Node com TypeScript (tsx para rodar em dev) e configurar o Fastify com uma rota GET /health retornando { status: "ok" }.

[x] 1.2 Banco de Dados Local: Subir um container PostgreSQL usando Docker (ou criar um banco gratuito no Neon.tech para ir direto ao ponto).

[x] 1.3 Modelagem (Schema): Configurar o Prisma e criar as 3 tabelas principais:

Monitor (id, name, url, isActive, consecutiveFailures, discordWebhook, createdAt)

PingLog (id, monitorId, statusCode, latencyMs, isUp, errorMessage, checkedAt)

Incident (id, monitorId, status, aiDiagnosis, startedAt, resolvedAt)

[x] 1.4 CRUD de Monitores: Criar as rotas da API para cadastrar (POST /monitors), listar (GET /monitors), pausar (PATCH /monitors/:id) e deletar (DELETE /monitors/:id) uma URL. Testar tudo usando o Insomnia, Postman ou extensão Thunder Client no VS Code.

Fase 2: O Motor de Monitoramento (O Coração do Back-end)
Objetivo: Fazer o servidor vigiar as URLs sozinho, mesmo sem ninguém usando o site.

[ ] 2.1 Função de Ping Isolada: Criar uma função checkUrl(url: string) que usa fetch com AbortSignal.timeout(5000). Ela deve retornar um objeto padronizado: { isUp: boolean, statusCode: number | null, latencyMs: number, error: string | null }.

[ ] 2.2 Agendador (Cron Job): Configurar o node-cron para rodar a cada 1 minuto (durante os testes, 1 minuto é melhor que 5 para você ver as coisas acontecendo rápido).

[ ] 2.3 Execução em Lote: Dentro do cron, buscar todos os monitores ativos no banco e executar o checkUrl para todos usando Promise.allSettled, salvando o resultado na tabela PingLog.

Fase 3: Inteligência de Incidentes e Alertas
Objetivo: Evitar spam e avisar no Discord quando algo cair de verdade.

[ ] 3.1 Contador de Falhas: Atualizar a lógica do cron: se o ping falhar, somar +1 em consecutiveFailures do monitor. Se der sucesso, zerar para 0.

[ ] 3.2 Abertura e Fechamento de Incidentes:

Se consecutiveFailures === 2: criar um registro na tabela Incident com status OPEN.

Se o ping voltar a dar sucesso (200-299) e houver um incidente OPEN para aquele monitor: atualizar o incidente para RESOLVED preenchendo resolvedAt.

[ ] 3.3 Alerta no Discord: Criar um servidor de testes no Discord, gerar uma URL de Webhook nas configurações do canal e disparar um POST avisando quando um incidente abrir e quando for resolvido.

Fase 4: A Camada de IA (Diagnóstico Técnico)
Objetivo: Dar superpoderes ao alerta usando o Gemini.

[ ] 4.1 Integração com SDK: Instalar @google/genai e configurar sua chave de API no .env.

[ ] 4.2 Prompt de Diagnóstico: No exato momento em que o incidente for aberto (falha nº 2), enviar os detalhes técnicos das duas falhas (código HTTP, mensagem de erro/timeout, URL) para a IA com uma instrução de sistema: "Você é um engenheiro SRE. Analise este erro de monitoramento e explique em até 2 frases curtas a causa técnica provável e o que o desenvolvedor deve verificar."

[ ] 4.3 Persistência e Envio: Salvar a resposta da IA no campo aiDiagnosis do incidente e incluir esse texto na mensagem enviada ao Discord.

Fase 5: Segurança e API para o Front-end
Objetivo: Preparar os dados bonitos para a tela e proteger a aplicação.

[ ] 5.1 Autenticação Simples: Implementar login/cadastro com JWT (ou usar uma biblioteca pronta como Better Auth / Clerk para não travar aqui) para que cada usuário veja apenas seus próprios monitores.

[ ] 5.2 Rota da Status Page: Criar uma rota GET /monitors/:id/metrics que agrupa os logs dos últimos 30 dias por dia (calculando % de uptime diário e média de latência) e retorna a lista de incidentes com os diagnósticos da IA.

Fase 6: Front-end (A Vitrine)
Objetivo: Construir a interface visual que impressiona recrutadores.

[ ] 6.1 Dashboard de Controle: Tela para adicionar URLs, colar o Webhook do Discord e ver o status atual (Online/Offline) em tempo real.

[ ] 6.2 Status Page Pública: Tela inspirada no UptimeRobot/Statuspage.io mostrando as 30 barrinhas verticais (verde = 100% online, amarelo = instável, vermelho = caiu), gráfico de linha com a latência em milissegundos e a linha do tempo de incidentes exibindo o card de "Diagnóstico da IA".
