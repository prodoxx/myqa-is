import prisma from '~/infrastructure/database/index.server';
import { QAEntity } from '../entities/qa';
import { IpfsPinRepository } from './ipfs-pin-repository';

export class QuestionRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new QAEntity({
      ...data,
      IpfsPin: await IpfsPinRepository.rebuildEntity(data.IpfsPin),
    });
  }

  static async create(data: QAEntity) {
    const result = await prisma.qA.create({
      data: data as any,
    });

    return this.rebuildEntity(result);
  }
}
