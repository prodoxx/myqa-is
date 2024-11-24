import type { UserProfile as UserProfileORM } from '@prisma/client';
import Failure from '~/lib/failure';

export class UserProfileEntity {
  id?: UserProfileORM['id'];
  createdAt: UserProfileORM['createdAt'];
  updatedAt: UserProfileORM['updatedAt'];
  country: UserProfileORM['country'];
  dateOfBirth: UserProfileORM['dateOfBirth'];
  userId: UserProfileORM['userId'];

  constructor(userProfile: UserProfileORM) {
    this.id = userProfile?.id;
    this.createdAt = userProfile?.createdAt;
    this.updatedAt = userProfile?.updatedAt;
    this.country = userProfile?.country;
    this.dateOfBirth = userProfile?.dateOfBirth;
    this.userId = userProfile?.userId;
  }

  isEqual(userProfile: UserProfileEntity) {
    return this.id === userProfile.id;
  }

  json(): UserProfileDTO {
    return {
      id: this.id,
      createdAt: this.createdAt.toString(),
      updatedAt: this.updatedAt.toString(),
      country: this.country,
      dateOfBirth: this.dateOfBirth,
      userId: this.userId,
    } as UserProfileDTO;
  }
}

export type UserProfileDTO = Omit<UserProfileEntity, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};
