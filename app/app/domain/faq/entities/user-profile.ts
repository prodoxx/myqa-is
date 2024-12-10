import {
  OnboardingStep as OnboardingStepORM,
  UserProfile as UserProfileORM,
} from '@prisma/client';
import { AssetDTO, AssetEntity } from './asset';
import { ExternalLinkDTO, ExternalLinkEntity } from './external-link';
import { WalletDTO, WalletEntity } from './wallet';
import { QuestionDTO, QuestionEntity } from './question';

export const OnboardingStep: typeof OnboardingStepORM = {
  PENDING: 'PENDING',
  BASIC_INFORMATION: 'BASIC_INFORMATION',
  SOCIAL_LINKS: 'SOCIAL_LINKS',
  CRYPTO_WALLET: 'CRYPTO_WALLET',
  DONE: 'DONE',
};

export class UserProfileEntity {
  id?: UserProfileORM['id'];
  createdAt: UserProfileORM['createdAt'];
  updatedAt: UserProfileORM['updatedAt'];
  country: UserProfileORM['country'];
  dateOfBirth: UserProfileORM['dateOfBirth'];
  userId: UserProfileORM['userId'];
  ExternalLinks?: ExternalLinkEntity[];
  Avatar?: AssetEntity;
  about?: UserProfileORM['about'];
  onboarding?: UserProfileORM['onboarding'];
  Wallet?: WalletEntity;
  Questions?: QuestionEntity[];

  constructor(
    userProfile: UserProfileORM & {
      ExternalLinks?: ExternalLinkEntity[];
      Avatar?: AssetEntity;
      Wallet?: WalletEntity;
      Questions: QuestionEntity[];
    }
  ) {
    this.id = userProfile?.id;
    this.createdAt = userProfile?.createdAt;
    this.updatedAt = userProfile?.updatedAt;
    this.country = userProfile?.country;
    this.dateOfBirth = userProfile?.dateOfBirth;
    this.userId = userProfile?.userId;
    this.ExternalLinks = userProfile?.ExternalLinks;
    this.Avatar = userProfile?.Avatar;
    this.onboarding = userProfile?.onboarding;
    this.Wallet = userProfile?.Wallet;
    this.Questions = userProfile?.Questions;
  }

  isEqual(userProfile: UserProfileEntity) {
    return this.id === userProfile.id;
  }

  isOnboardingComplete() {
    return this.onboarding === OnboardingStep.DONE;
  }

  getNextOnboardingStep() {
    if (this.isOnboardingComplete()) {
      return OnboardingStep.DONE;
    }

    if (this.onboarding === OnboardingStep.PENDING) {
      return OnboardingStep.BASIC_INFORMATION;
    }

    if (this.onboarding === OnboardingStep.BASIC_INFORMATION) {
      return OnboardingStep.SOCIAL_LINKS; // swap to OnboardingStep.CRYPTO_WALLET when support is added
    }

    if (this.onboarding === OnboardingStep.SOCIAL_LINKS) {
      return OnboardingStep.CRYPTO_WALLET;
    }

    if (this.onboarding === OnboardingStep.CRYPTO_WALLET) {
      return OnboardingStep.DONE;
    }

    return OnboardingStep.DONE;
  }

  json(): UserProfileDTO {
    return {
      id: this.id,
      createdAt: this.createdAt.toString(),
      updatedAt: this.updatedAt.toString(),
      country: this.country,
      dateOfBirth: this.dateOfBirth,
      userId: this.userId,
      about: this.about,
      onboarding: this.onboarding,
      ExternalLinks: this.ExternalLinks?.map((c) => c.json()),
      Avatar: this.Avatar?.json(),
      Wallet: this.Wallet?.json(),
      Questions: this.Questions?.map((c) => c.json()),
    } as UserProfileDTO;
  }
}

export type UserProfileDTO = Omit<
  UserProfileEntity,
  | 'createdAt'
  | 'updatedAt'
  | 'ExternalLinks'
  | 'Avatar'
  | 'Wallet'
  | 'Questions'
> & {
  createdAt?: string;
  updatedAt?: string;
  ExternalLinks: ExternalLinkDTO[];
  Avatar: AssetDTO;
  Wallet: WalletDTO;
  Questions: QuestionDTO[];
};
