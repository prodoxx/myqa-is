import prisma from '~/infrastructure/database/index.server';
import { QAEntity } from '../entities/question';

export class QuestionRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new QAEntity(data);
  }

  static async create(data: QAEntity) {
    const result = await prisma.qA.create({
      data: data as any,
    });

    return this.rebuildEntity(result);
  }
}
