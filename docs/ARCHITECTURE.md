sentinel-api/
├── docker-compose.yml # Banco PostgreSQL exclusivo da API
├── prisma/
│ ├── migrations/
│ └── schema.prisma # O mesmo schema que definimos antes
├── src/
│ ├── config/
│ │ └── env.ts # Validação das variáveis (.env)
│ ├── lib/
│ │ ├── prisma.ts # Conexão com o banco
│ │ └── gemini.ts # Cliente da API do Gemini
│ ├── routes/
│ │ └── monitors.routes.ts # Endpoints REST (GET, POST, PATCH, DELETE)
│ ├── services/
│ │ ├── ping.service.ts # Lógica de verificação HTTP + Timeout
│ │ ├── incident.service.ts # Abertura/fechamento de incidentes + Diagnóstico IA
│ │ └── discord.service.ts # Envio de alertas via Webhook
│ ├── workers/
│ │ └── monitor.worker.ts # Cron Job de monitoramento
│ └── server.ts # Inicializa Fastify, CORS e Worker
├── .env # Segredos (não vai para o Git)
├── .env.example # Exemplo das variáveis (vai para o Git)
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
