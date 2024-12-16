// import type { LoaderFunctionArgs } from '@vercel/remix';
import { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export let loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  });
};
