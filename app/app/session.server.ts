import { createCookieSessionStorage } from '@vercel/remix';

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets:
      process.env.NODE_ENV !== 'production'
        ? ['s3cr3t']
        : [process.env.PASSWORD_COOKIE_SECRET as string],
    secure: process.env.NODE_ENV === 'production',
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
