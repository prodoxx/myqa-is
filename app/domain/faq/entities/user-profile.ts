import type { UserProfile as UserProfileORM } from '@prisma/client';
import { ExternalLinkEntity } from './external-link';
import { AssetEntity } from './asset';
import { OnboardingFlow } from '~/ui/organisms/onboarding';
import { UserEntity } from './user';

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

  constructor(userProfile: UserProfileORM & { ExternalLinks?: ExternalLinkEntity[]; Avatar?: AssetEntity }) {
    this.id = userProfile?.id;
    this.createdAt = userProfile?.createdAt;
    this.updatedAt = userProfile?.updatedAt;
    this.country = userProfile?.country;
    this.dateOfBirth = userProfile?.dateOfBirth;
    this.userId = userProfile?.userId;
    this.ExternalLinks = userProfile?.ExternalLinks;
    this.Avatar = userProfile?.Avatar;
  }

  isEqual(userProfile: UserProfileEntity) {
    return this.id === userProfile.id;
  }

  isOnboardingComplete() {
    return this.about && this.Avatar;
  }

  currentOnboardingStep(user: UserEntity) {
    if (!user.username && (!this.Avatar || !this.about)) {
      return OnboardingFlow.BasicInformation;
    }

    return OnboardingFlow.Done;
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
      ExternalLinks: this.ExternalLinks?.map((c) => c.json()),
      Avatar: this.Avatar?.json(),
    } as UserProfileDTO;
  }
}

export type UserProfileDTO = Omit<UserProfileEntity, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};
