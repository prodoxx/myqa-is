import { ActionFunctionArgs } from '@vercel/remix';
import { redirect } from 'remix-typedjson';
import { destroySession, getSession } from '~/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session) {
    redirect('/login');
  }

  return redirect('/', {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
};
