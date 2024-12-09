import prisma from '~/infrastructure/database/index.server';
import { QuestionEntity } from '../entities/question';

export class QuestionRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new QuestionEntity(data);
  }

  static async create(data: QuestionEntity) {
    const result = await prisma.question.create({
      data,
    });

    return this.rebuildEntity(result);
  }
}
