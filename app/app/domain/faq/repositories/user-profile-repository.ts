import prisma from '~/infrastructure/database/index.server';
import { UserProfileEntity } from '../entities/user-profile';
import { ExternalLinkRepository } from './external-link-repository';
import { ExternalLinkDTO } from '../entities/external-link';

export class UserProfileRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new UserProfileEntity({
      ...data,
      ExternalLinks: data?.ExternalLinks
        ? data?.ExternalLinks?.map((c: ExternalLinkDTO) =>
            ExternalLinkRepository.rebuildEntity(c)
          )
        : [],
    });
  }

  static async onboardUserByUserId(
    userId: number,
    updates: Partial<
      Pick<
        UserProfileEntity,
        'Avatar' | 'about' | 'ExternalLinks' | 'onboarding' | 'Wallet'
      > & { username?: string }
    >
  ) {
    const result = await prisma.userProfile.update({
      data: {
        about: updates?.about,
        onboarding: updates?.onboarding,
        ...(updates?.username
          ? { User: { update: { username: updates?.username! } } }
          : {}),
        ...(updates?.ExternalLinks
          ? {
              ExternalLinks: {
                createMany: { data: updates!.ExternalLinks },
              },
            }
          : {}),
        ...(updates?.Wallet
          ? { Wallet: { connect: { id: updates?.Wallet?.id } } }
          : {}),
      },
      where: {
        userId,
      },
      include: {
        Avatar: true,
        ExternalLinks: true,
      },
    });

    return this.rebuildEntity(result);
  }
}
