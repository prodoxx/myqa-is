import prisma from '~/infrastructure/database/index.server';
import { WalletEntity } from '../entities/wallet';

export class WalletRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new WalletEntity(data);
  }

  static async create(data: Partial<WalletEntity> & { key: string }) {
    const result = await prisma.wallet.create({
      data,
    });

    return this.rebuildEntity(result);
  }

  static async upsertByUserProfileId(
    userProfileId: string,
    data: Partial<WalletEntity> & { userProfileId: string }
  ) {
    const result = await prisma.wallet.upsert({
      create: {
        key: data?.key!,
        userProfileId,
      },
      update: {
        key: data?.key,
      },
      where: {
        userProfileId,
      },
    });

    return this.rebuildEntity(result);
  }
}
