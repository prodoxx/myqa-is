import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { redirect } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { MainLayout } from '~/ui/layouts/main';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'MyFAQ.is | MyFAQ.is',
    },
    {
      name: 'description',
      content: 'Your AI trip planner',
    },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const userId = (await authenticator.isAuthenticated(args.request, {}))?.id;
  const user = await UserRepository.findByUserId(userId!);

  if (!user?.UserProfile?.isOnboardingComplete()) {
    return redirect('/onboarding');
  }

  return null;
};

export default function Index() {
  return (
    <MainLayout>
      <span className="mx-auto my-auto">Coming Soon...</span>
    </MainLayout>
  );
}
