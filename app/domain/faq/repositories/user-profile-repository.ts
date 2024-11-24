import prisma from '~/infrastructure/database/index.server';
import { UserProfileEntity } from '../entities/user-profile';
import { UserProfile } from '@prisma/client';

export class UserProfileRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new UserProfileEntity({
      ...data,
    });
  }

  static async onboardUserByUserId(userId: number, updates: Partial<Pick<UserProfile, 'dateOfBirth' | 'country'>>) {
    const result = await prisma.userProfile.update({
      data: {
        dateOfBirth: updates?.dateOfBirth,
        country: updates?.country,
      },
      where: {
        userId,
      },
    });

    return this.rebuildEntity(result);
  }
}
