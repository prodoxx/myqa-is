import prisma from '~/infrastructure/database/index.server';
import { ExternalLinkDTO } from '../entities/external-link';
import { QaDTO } from '../entities/question';
import { UserProfileEntity } from '../entities/user-profile';
import { AssetRepository } from './asset-repository';
import { ExternalLinkRepository } from './external-link-repository';
import { QuestionRepository } from './question-repository';

export class UserProfileRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new UserProfileEntity({
      ...data,
      ExternalLinks: data?.ExternalLinks
        ? await Promise.all(
            data?.ExternalLinks?.map((c: ExternalLinkDTO) =>
              ExternalLinkRepository.rebuildEntity(c)
            )
          )
        : [],
      Avatar: data?.Avatar
        ? await AssetRepository.rebuildEntity(data?.Avatar)
        : undefined,
      QAs: data?.QAs
        ? await Promise.all(
            data?.QAs?.map((c: QaDTO) => QuestionRepository.rebuildEntity(c))
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
        QAs: true,
      },
    });

    return this.rebuildEntity(result);
  }
}
