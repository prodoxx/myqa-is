import { PrismaClient } from '@prisma/client';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

console.log('LOADING...', process.env);

const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL as string,
      },
    },
  }).$extends(
    fieldEncryptionExtension({
      encryptionKey: process.env.ENCRYPTION_KEY as string,
    })
  );

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
