import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // Mostra as queries SQL no terminal durante o desenvolvimento (ótimo para aprender!)
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
