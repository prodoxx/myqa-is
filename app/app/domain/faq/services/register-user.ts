import { AuthorizationError, Authorizer } from 'remix-auth';
import { comparePassword, getHashedPassword } from '~/auth.server';
import type { UserEntity } from '../entities/user';
import { UserRepository } from '../repositories/user-repository';
import { registerSchema } from '~/presentation/requests/register';

export class RegisterUser {
  private name: string;
  private email: string;
  private password: string;
  private user?: UserEntity;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async verifyFormData() {
    await registerSchema.parseAsync({
      name: this.name,
      email: this.email,
      password: this.password,
    });
  }

  async call() {
    await this.verifyFormData();
    this.user = await UserRepository.findByEmail(this.email);

    if (this.user) {
      throw new AuthorizationError('A user already exists with this email');
    }

    this.user = await UserRepository.createUser(this.name, this.email, await getHashedPassword(this.password));

    return this.user;
  }
}
