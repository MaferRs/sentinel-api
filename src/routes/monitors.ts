import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export async function monitorsRoutes(app: FastifyInstance) {
  // 1. Criar novo monitor
  app.post('/monitors', async (request, reply) => {
    const createMonitorSchema = z.object({
      name: z.string().min(1, 'O nome é obrigatório'),
      url: z.string().url('A URL precisa ser válida (ex: https://meusite.com)'),
      discordWebhook: z.string().url('O webhook do Discord deve ser uma URL válida').optional().nullable(),
    });

    const parsed = createMonitorSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.format(),
      });
    }

    const { name, url, discordWebhook } = parsed.data;

    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        discordWebhook: discordWebhook || null,
      },
    });

    return reply.status(201).send(monitor);
  });

  // 2. Listar todos os monitores
  app.get('/monitors', async () => {
    const monitors = await prisma.monitor.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            incidents: true,
            pingLogs: true,
          },
        },
      },
    });

    return monitors;
  });

  // 3. Obter detalhes de um monitor específico
  app.get('/monitors/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    });

    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      return reply.status(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    const monitor = await prisma.monitor.findUnique({
      where: { id },
      include: {
        pingLogs: {
          take: 10,
          orderBy: { checkedAt: 'desc' },
        },
        incidents: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!monitor) {
      return reply.status(404).send({ error: 'Monitor não encontrado' });
    }

    return monitor;
  });

  // 4. Atualizar / pausar / retomar monitor
  app.patch('/monitors/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    });

    const updateMonitorSchema = z.object({
      name: z.string().min(1).optional(),
      url: z.string().url().optional(),
      isActive: z.boolean().optional(),
      discordWebhook: z.string().url().optional().nullable(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({ error: 'ID inválido' });
    }

    const parsedBody = updateMonitorSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({
        error: 'Dados inválidos para atualização',
        details: parsedBody.error.format(),
      });
    }

    const { id } = parsedParams.data;

    const existingMonitor = await prisma.monitor.findUnique({
      where: { id },
    });

    if (!existingMonitor) {
      return reply.status(404).send({ error: 'Monitor não encontrado' });
    }

    const updatedMonitor = await prisma.monitor.update({
      where: { id },
      data: parsedBody.data,
    });

    return updatedMonitor;
  });

  // 5. Deletar monitor
  app.delete('/monitors/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({ error: 'ID inválido' });
    }

    const { id } = parsedParams.data;

    const existingMonitor = await prisma.monitor.findUnique({
      where: { id },
    });

    if (!existingMonitor) {
      return reply.status(404).send({ error: 'Monitor não encontrado' });
    }

    await prisma.monitor.delete({
      where: { id },
    });

    return reply.status(200).send({ message: 'Monitor removido com sucesso' });
  });
}
