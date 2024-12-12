import type { QA as QaORM } from '@prisma/client';

export class QAEntity {
  id?: QaORM['id'];
  question: QaORM['question'];
  userProfileId: QaORM['userProfileId'];
  maxKeys: QaORM['maxKeys'];
  ipfsPinId: QaORM['ipfsPinId'];
  onChainId: QaORM['onChainId'];
  questionHash: QaORM['questionHash'];
  encryptedAnswer: QaORM['encryptedAnswer'];
  unlockPriceInBonk: QaORM['unlockPriceInBonk'];

  constructor(
    question: Pick<
      QaORM,
      | 'question'
      | 'userProfileId'
      | 'maxKeys'
      | 'ipfsPinId'
      | 'onChainId'
      | 'questionHash'
      | 'encryptedAnswer'
      | 'unlockPriceInBonk'
    > &
      Partial<Pick<QaORM, 'id'>>
  ) {
    this.id = question.id;
    this.question = question.question;
    this.userProfileId = question.userProfileId;
    this.maxKeys = question.maxKeys;
    this.ipfsPinId = question.ipfsPinId;
    this.onChainId = question.onChainId;
    this.questionHash = question.questionHash;
    this.encryptedAnswer = question.encryptedAnswer;
    this.unlockPriceInBonk = question.unlockPriceInBonk;
  }

  json(): QaDTO {
    return {
      id: this.id,
      question: this.question,
      userProfileId: this.userProfileId,
      maxKeys: this.maxKeys,
      ipfsPinId: this.ipfsPinId,
      onChainId: this.onChainId,
      questionHash: this.questionHash,
      encryptedAnswer: this.encryptedAnswer,
      unlockPriceInBonk: this.unlockPriceInBonk,
    } as QaDTO;
  }
}

export type QaDTO = QAEntity;
