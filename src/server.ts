import fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { monitorsRoutes } from './routes/monitors.js';

export const app = fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

// Registro das Rotas
await app.register(monitorsRoutes);

// Rota Raiz
app.get('/', async () => {
  return {
    message: 'Sentinel API está online!',
    docs: '/health',
  };
});

// Rota de Health Check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const port = Number(process.env.PORT) || 3333;

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Sentinel API rodando em http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
