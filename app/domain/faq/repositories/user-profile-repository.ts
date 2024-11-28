import prisma from '~/infrastructure/database/index.server';
import { UserProfileEntity } from '../entities/user-profile';

export class UserProfileRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new UserProfileEntity({
      ...data,
    });
  }

  static async onboardUserByUserId(
    userId: number,
    updates: Partial<Pick<UserProfileEntity, 'Avatar' | 'about' | 'ExternalLinks'> & { username?: string }>,
  ) {
    const result = await prisma.userProfile.update({
      data: {
        about: updates?.about,
        ...(updates?.username ? { User: { update: { username: updates?.username! } } } : {}),
      },
      where: {
        userId,
      },
    });

    return this.rebuildEntity(result);
  }
}
