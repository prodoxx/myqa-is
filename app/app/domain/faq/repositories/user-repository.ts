import prisma from '~/infrastructure/database/index.server';
import type { UserDTO } from '../entities/user';
import { UserEntity } from '../entities/user';
import { UserProfileRepository } from './user-profile-repository';

export class UserRepository {
  static async rebuildEntity(data: any) {
    if (!data || typeof data === 'undefined') {
      return undefined;
    }

    return new UserEntity({
      ...data,
      UserProfile: await UserProfileRepository.rebuildEntity(data.UserProfile),
    });
  }

  static async findByUserId(userId: number) {
    const result = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        UserProfile: {
          include: {
            ExternalLinks: true,
            QAs: true,
          },
        },
      },
    });

    return await this.rebuildEntity(result);
  }

  static async findUserByUsername(username: string) {
    const result = await prisma.user.findFirst({
      where: { username: username },
    });

    return await this.rebuildEntity(result);
  }

  static async findByEmail(email: string) {
    const result = await prisma.user.findFirst({
      where: { email },
    });

    return await this.rebuildEntity(result);
  }

  static async updateUserPassword(user: UserEntity, hashedPassword: string) {
    const result = await prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: user.id },
    });

    return await this.rebuildEntity(result);
  }

  static async updateUser(user: UserEntity, data: Partial<UserDTO>) {
    const updates = { ...data, UserProfile: undefined };
    const result = await prisma.user.update({
      data: updates,
      where: { id: user.id },
    });

    return await this.rebuildEntity(result);
  }

  static async createUser(email: string, hashedPassword: string) {
    const result = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        UserProfile: {
          create: {},
        },
      },
    });

    return await this.rebuildEntity(result);
  }

  static async findOrCreate(email: string) {
    const result = await prisma.user.upsert({
      create: {
        email,
        UserProfile: {
          create: {},
        },
      },
      update: {
        email,
      },
      where: {
        email,
      },
    });

    return await this.rebuildEntity(result);
  }

  static async findByUsername(
    username: string,
    options?: { questions?: { page: number; size: number } }
  ) {
    const result = await prisma.user.findFirst({
      where: {
        username,
      },
      include: {
        UserProfile: {
          include: {
            Avatar: true,
            ExternalLinks: true,
            QAs: {
              take: options?.questions?.size ?? 5,
              skip:
                (options?.questions?.page ?? 0) *
                (options?.questions?.size ?? 5),
            },
          },
        },
      },
    });

    return await this.rebuildEntity(result);
  }
}
