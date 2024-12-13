import { OnboardingStep, SocialLink } from '@prisma/client';
import {
  NodeOnDiskFile,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import assert from 'http-assert';
import z from 'zod';
import { BlobStorage } from '~/infrastructure/storage';
import { uploadHandler } from '~/utils/file-upload-handler';
import { ExternalLinkEntity } from '../entities/external-link';
import { UserProfileEntity } from '../entities/user-profile';
import { AssetRepository } from '../repositories/asset-repository';
import { UserProfileRepository } from '../repositories/user-profile-repository';
import { UserRepository } from '../repositories/user-repository';
import prisma from '~/infrastructure/database/index.server';

export const onboardUserSchema = z.object({
  onboarding: z.nativeEnum(OnboardingStep),
  username: z.string().min(1).optional(),
  avatar: z.any().optional(),
  about: z.string().optional(),
  externalLinks: z
    .array(
      z.object({
        url: z.string().min(1).optional(),
        type: z.nativeEnum(SocialLink).optional(),
      })
    )
    .optional(),
  publicKey: z.string().min(1).optional(),
});

export type OnboardUserFormErrors = z.inferFlattenedErrors<
  typeof onboardUserSchema
>['fieldErrors'];

export class OnboardUser {
  private userId: number;
  private request: Request;

  constructor(userId: number, request: Request) {
    this.userId = userId;
    this.request = request;
  }

  async validateParams() {
    const formData = await unstable_parseMultipartFormData(
      this.request,
      uploadHandler
    );

    const about = formData.get('about');
    const username = formData.get('username');
    const publicKey = formData.get('publicKey');
    const socialLinks = formData.get('socialLinks');

    const data = await onboardUserSchema.parseAsync({
      onboarding: formData.get('onboarding'),
      about: about === null ? undefined : about,
      username: username === null ? undefined : username,
      avatar: formData.get('avatar'),
      externalLinks: socialLinks ? JSON.parse(String(socialLinks)) : undefined,
      publicKey: publicKey === null ? undefined : publicKey,
    });

    return data;
  }

  async updateAvatar(userProfile: UserProfileEntity, avatar?: any) {
    if (!avatar || !(avatar instanceof NodeOnDiskFile)) {
      return;
    }

    const filename = `${this.userId}/${avatar.name}`;
    const result = await new BlobStorage(filename, avatar).upload();
    const entity = await AssetRepository.upsertByUserProfileId(
      userProfile.id!,
      {
        url: result,
        userProfileId: userProfile.id!,
      }
    );
    return entity;
  }

  async updateWallet(userId: number, key?: string | null) {
    if (!key) {
      return;
    }

    try {
      return await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          walletPublicKey: key,
        },
      });
    } catch (error) {
      throw new Error(
        'A user has already linked the provided wallet to their profile. Please choose another wallet.'
      );
    }
  }

  getExternalLinks(data?: z.infer<typeof onboardUserSchema>['externalLinks']) {
    if (!data) {
      return;
    }

    const filteredResults = data?.filter((c) => !!c.url && !!c.type); // valid urls only
    if (filteredResults?.length) {
      return filteredResults.map(
        (c) => new ExternalLinkEntity({ type: c.type!, url: c.url! })
      );
    }

    return [];
  }

  async call() {
    const user = await UserRepository.findByUserId(this.userId);
    assert(user?.id, 404, 'User does not exist');

    const data = await this.validateParams();
    const [avatar, updatedUser] = await Promise.all([
      this.updateAvatar(user.UserProfile, data.avatar),
      this.updateWallet(user.id, data.publicKey),
    ]);

    // Set the current step as the current onboarding
    user.UserProfile.onboarding = data.onboarding;

    const updatedUserProfile = await UserProfileRepository.onboardUserByUserId(
      this.userId,
      {
        onboarding: user.UserProfile.getNextOnboardingStep(),
        username: data.username ?? undefined,
        Avatar: avatar,
        about: data.about ?? null,
        ExternalLinks: this.getExternalLinks(data?.externalLinks),
      }
    );

    if (updatedUserProfile) {
      updatedUserProfile.Avatar = avatar;
      user.UserProfile = updatedUserProfile;
      user.walletPublicKey = updatedUser?.walletPublicKey;
      user.username = data.username || user.username;
    }

    return user;
  }
}
