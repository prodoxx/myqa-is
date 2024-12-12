import type { IpfsPin as IpfsPinORM } from '@prisma/client';

export class IpfsPinEntity {
  id: IpfsPinORM['id'];
  cid: IpfsPinORM['cid'];
  status: IpfsPinORM['status'];
  symmetricKey: IpfsPinORM['symmetricKey'];
  createdAt: IpfsPinORM['createdAt'];
  updatedAt: IpfsPinORM['updatedAt'];
  userId: IpfsPinORM['userId'];
  qaId: IpfsPinORM['qaId'];

  constructor(
    ipfsPin: Omit<IpfsPinORM, 'id'> & Partial<Pick<IpfsPinORM, 'id'>>
  ) {
    this.id = ipfsPin.id!;
    this.cid = ipfsPin.cid;
    this.status = ipfsPin.status;
    this.symmetricKey = ipfsPin.symmetricKey;
    this.createdAt = ipfsPin.createdAt;
    this.updatedAt = ipfsPin.updatedAt;
    this.userId = ipfsPin.userId;
    this.qaId = ipfsPin.qaId;
  }

  json(): IpfsPinEntityDTO {
    return {
      id: this.id,
      cid: this.cid,
      status: this.status,
      userId: this.userId,
      qaId: this.qaId,
    } as IpfsPinEntityDTO;
  }
}

export type IpfsPinEntityDTO = Pick<
  IpfsPinEntity,
  'id' | 'cid' | 'status' | 'userId' | 'qaId'
>;
