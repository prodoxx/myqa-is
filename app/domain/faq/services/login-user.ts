import { AuthorizationError } from 'remix-auth';
import { comparePassword } from '~/auth.server';
import { loginSchema } from '~/presentation/requests/login';
import type { UserEntity } from '../entities/user';
import { UserRepository } from '../repositories/user-repository';

export class LoginUser {
  private email: string;
  private password: string;
  private user?: UserEntity;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  async verifyFormData() {
    await loginSchema.parseAsync({
      email: this.email,
      password: this.password,
    });
  }

  async isPasswordValid() {
    return await comparePassword(this.password, this.user?.password as string);
  }

  async call() {
    await this.verifyFormData();
    this.user = await UserRepository.findByEmail(this.email);

    if (!this.user || !(await this.isPasswordValid())) {
      throw new AuthorizationError('The provided credentials are invalid');
    }

    return this.user;
  }
}
