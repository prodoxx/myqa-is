import type { Wallet as WalletORM } from '@prisma/client';

export class WalletEntity {
  id?: WalletORM['id'];
  key?: WalletORM['key'];
  userProfileId?: WalletORM['userProfileId'];

  constructor(data: Partial<WalletEntity>) {
    this.id = data?.id;
    this.key = data?.key;
    this.userProfileId = data?.userProfileId;
  }

  json(): WalletDTO {
    return {
      id: this.id,
      key: this.key,
      userProfileId: this.userProfileId,
    };
  }
}

export type WalletDTO = Partial<WalletEntity>;
