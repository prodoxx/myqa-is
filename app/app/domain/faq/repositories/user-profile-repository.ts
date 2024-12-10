import prisma from '~/infrastructure/database/index.server';
import { UserProfileEntity } from '../entities/user-profile';
import { ExternalLinkRepository } from './external-link-repository';
import { ExternalLinkDTO } from '../entities/external-link';
import { AssetRepository } from './asset-repository';
import { QuestionDTO } from '../entities/question';
import { QuestionRepository } from './question-repository';
import { WalletRepository } from './wallet-repository';

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
      Questions: data?.Questions ? await Promise.all(data?.Questions?.map((c: QuestionDTO) => QuestionRepository.rebuildEntity(c))) : [],
      Wallet: data?.Wallet ? await WalletRepository.rebuildEntity(data?.Wallet) : undefined
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
        Wallet: true,
      },
    });

    return this.rebuildEntity(result);
  }
}
