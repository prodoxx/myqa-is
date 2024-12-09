import type { Question as QuestionORM } from '@prisma/client';

export class QuestionEntity {
  id?: QuestionORM['id'];
  title: QuestionORM['title'];
  lockedAnswerId: QuestionORM['lockedAnswerId'];
  userProfileId: QuestionORM['userProfileId'];

  constructor(
    question: Pick<QuestionORM, 'title' | 'lockedAnswerId' | 'userProfileId'> &
      Partial<Pick<QuestionORM, 'id'>>
  ) {
    this.id = question.id;
    this.title = question.title;
    this.lockedAnswerId = question.lockedAnswerId;
    this.userProfileId = question.userProfileId;
  }

  json(): QuestionDTO {
    return {
      id: this.id,
      title: this.title,
      lockedAnswerId: this.lockedAnswerId,
      userProfileId: this.userProfileId,
    } as QuestionDTO;
  }
}

export type QuestionDTO = QuestionEntity;
