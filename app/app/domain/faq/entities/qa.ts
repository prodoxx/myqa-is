import type { QA as QaORM } from '@prisma/client';

export class QAEntity {
  id?: QaORM['id'];
  question: QaORM['question'];
  maxKeys: QaORM['maxKeys'];
  currentKeys: QaORM['currentKeys'];
  unlockPriceInBonk: QaORM['unlockPriceInBonk'];
  userProfileId: QaORM['userProfileId'];

  constructor(
    question: Pick<
      QaORM,
      | 'question'
      | 'userProfileId'
      | 'maxKeys'
      | 'currentKeys'
      | 'unlockPriceInBonk'
    > &
      Partial<Pick<QaORM, 'id'>>
  ) {
    this.id = question.id;
    this.question = question.question;
    this.maxKeys = question.maxKeys;
    this.currentKeys = question.currentKeys;
    this.unlockPriceInBonk = question.unlockPriceInBonk;
    this.userProfileId = question.userProfileId;
  }

  json(): QaDTO {
    return {
      id: this.id,
      question: this.question,
      maxKeys: this.maxKeys,
      currentKeys: this.currentKeys,
      userProfileId: this.userProfileId,
      unlockPriceInBonk: this.unlockPriceInBonk,
    } as QaDTO;
  }
}

export type QaDTO = QAEntity;
