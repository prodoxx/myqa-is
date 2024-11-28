import z from 'zod';
import { UserRepository } from '../repositories/user-repository';
import assert from 'http-assert';
import { UserProfileRepository } from '../repositories/user-profile-repository';
import { BlobStorage } from '~/infrastructure/storage';
import { AssetRepository } from '../repositories/asset-repository';
import { UserProfileEntity } from '../entities/user-profile';
import { NodeOnDiskFile, unstable_parseMultipartFormData } from '@remix-run/node';
import { uploadHandler } from '~/utils/file-upload-handler';

export const onboardUserSchema = z.object({
  username: z.string().min(1),
  avatar: z.instanceof(NodeOnDiskFile).nullable(),
  about: z.string().nullable(),
});

export type OnboardUserFormErrors = z.inferFlattenedErrors<typeof onboardUserSchema>['fieldErrors'];

export class OnboardUser {
  private userId: number;
  private request: Request;

  constructor(userId: number, request: Request) {
    this.userId = userId;
    this.request = request;
  }

  async validateParams() {
    const formData = await unstable_parseMultipartFormData(this.request, uploadHandler);
    const data = await onboardUserSchema.parseAsync({
      about: formData.get('about'),
      username: formData.get('username'),
      avatar: formData?.get('avatar'),
    });

    return data;
  }

  async updateAvatar(userProfile: UserProfileEntity, avatar?: NodeOnDiskFile | null) {
    if (!avatar) {
      return;
    }

    const filename = `${this.userId}/${avatar.name}`;
    const result = await new BlobStorage(filename, avatar).upload();
    const entity = await AssetRepository.upsertByUserProfileId(userProfile.id!, {
      url: result,
      userProfileId: userProfile.id!,
    });
    return entity;
  }

  async call() {
    const user = await UserRepository.findByUserId(this.userId);
    assert(user, 404, 'User does not exist');

    const data = await this.validateParams();
    const avatar = await this.updateAvatar(user.UserProfile, data.avatar);
    const updatedUser = await UserProfileRepository.onboardUserByUserId(this.userId, data);

    updatedUser!.Avatar = avatar!;
    user.UserProfile = updatedUser!;

    return user;
  }
}
