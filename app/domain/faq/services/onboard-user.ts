import z from 'zod';
import { UserRepository } from '../repositories/user-repository';
import assert from 'http-assert';
import { UserProfileRepository } from '../repositories/user-profile-repository';

export const onboardUserSchema = z.object({
  username: z.string().min(1),
  avatar: z.instanceof(File).nullable(),
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
    const formData = await this.request.formData();
    const data = await onboardUserSchema.parseAsync({
      about: formData.get('about'),
      username: formData.get('username'),
      avatar: formData?.get('avatar'),
    });

    return data;
  }

  async updateAvatar(avatar?: File) {
    if (!avatar) {
      return;
    }
  }

  async call() {
    const user = await UserRepository.findByUserId(this.userId);
    assert(user, 404, 'User does not exist');

    const data = await this.validateParams();
    const updatedUser = await UserProfileRepository.onboardUserByUserId(this.userId, data);

    user.UserProfile = updatedUser!;

    return user;
  }
}
