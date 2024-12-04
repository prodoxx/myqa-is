import bycrypt from 'bcryptjs';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/session.server';
import type { UserDTO } from './domain/faq/entities/user';
import { LoginUser } from './domain/faq/services/login-user';
import { GoogleStrategy } from 'remix-auth-google';
import { UserRepository } from './domain/faq/repositories/user-repository';

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

let googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL!,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    const result = (await UserRepository.findOrCreate(profile.emails?.[0]?.value)) ?? null;
    if (!result) {
      return null;
    }

    return result.json();
  },
);

// Add the local strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const user = await new LoginUser(form.get('email') as string, form.get('password') as string).call();

    return user.json();
  }),
  'user-pass',
);

// Add google strategy
authenticator.use(googleStrategy);
