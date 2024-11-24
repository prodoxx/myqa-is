import bycrypt from 'bcryptjs';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/session.server';
import type { UserDTO } from './domain/faq/entities/user';
import { LoginUser } from './domain/faq/services/login-user';

export const getHashedPassword = async (password: string) => {
  const saltRounds = 12;
  return await bycrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bycrypt.compare(password, hash);
};

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export let authenticator = new Authenticator<UserDTO | null>(sessionStorage, { throwOnError: true });

// Add the local strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const user = await new LoginUser(form.get('email') as string, form.get('password') as string).call();

    return user.json();
  }),
  'user-pass',
);
