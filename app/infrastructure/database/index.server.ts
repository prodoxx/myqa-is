// import type { Ekyash as EkyashORM, Order as OrderORM, User as UserORM } from '@prisma/client';
// import { Currency, OrderStatus, PrismaClient } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma =
  global.prisma || new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_PRISMA_URL as string } } });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
