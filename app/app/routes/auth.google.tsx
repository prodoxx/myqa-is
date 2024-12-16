// import { redirect, type ActionFunctionArgs } from '@vercel/remix';
import { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export let loader = () => redirect('/login');

export let action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate('google', request);
};
