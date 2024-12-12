import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { redirect } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { destroySession, getSession } from '~/session.server';
import { MainLayout } from '~/ui/layouts/main';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'MyFAQ.is | MyFAQ.is',
    },
    {
      name: 'description',
      content: "MyFAQ.is | Your Fan's Preferred Way to Get to Know You",
    },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const userId = (await authenticator.isAuthenticated(args.request, {}))?.id;
  const user = await UserRepository.findByUserId(userId!);

  if (!user) {
    const session = await getSession(args.request.headers.get('Cookie'));
    return redirect('/login', {
      headers: { 'Set-Cookie': await destroySession(session) },
    });
  }

  if (!user?.UserProfile?.isOnboardingComplete()) {
    return redirect('/onboarding');
  }

  return redirect(`/${user?.username}`);
};

export default function Index() {
  return (
    <MainLayout>
      <span className="mx-auto my-auto">Coming Soon...</span>
    </MainLayout>
  );
}
