import type { Asset as AssetORM } from '@prisma/client';

export class AssetEntity {
  id?: AssetORM['id'];
  url?: AssetORM['url'];
  userProfileId?: AssetORM['userProfileId'];

  json(): AssetDTO {
    return {
      id: this.id,
      url: this.url,
      userProfileId: this.userProfileId,
    };
  }
}

export type AssetDTO = Partial<AssetEntity>;
