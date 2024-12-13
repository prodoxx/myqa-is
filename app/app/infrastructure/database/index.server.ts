import { PrismaClient } from '@prisma/client';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: ReturnType<typeof createPrismaClient>;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required but not set'
    );
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL as string,
      },
    },
  });

  return prisma.$extends(
    fieldEncryptionExtension({
      encryptionKey: process.env.ENCRYPTION_KEY as string,
    })
  );
};

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
