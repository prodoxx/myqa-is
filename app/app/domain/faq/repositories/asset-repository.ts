import prisma from '~/infrastructure/database/index.server';
import { AssetEntity } from '../entities/asset';

export class AssetRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new AssetEntity(data);
  }

  static async create(data: Partial<AssetEntity> & { url: string }) {
    const result = await prisma.asset.create({
      data,
    });

    return this.rebuildEntity(result);
  }

  static async upsertByUserProfileId(userProfileId: string, data: Partial<AssetEntity> & { userProfileId: string }) {
    const result = await prisma.asset.upsert({
      create: {
        url: data?.url!,
        userProfileId,
      },
      update: {
        url: data?.url,
      },
      where: {
        userProfileId,
      },
    });

    return this.rebuildEntity(result);
  }
}
