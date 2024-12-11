import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { MainLayout } from '~/ui/layouts/main';
import { NewQuestionForm } from '~/ui/organisms/questions/new-question-form.client';

export const meta: MetaFunction = () => {
  return [
    {
      title: "MyFAQ.is | Your Fan's Preferred Way to Get to Know You",
    },
    {
      name: 'description',
      content:
        'Discover the stories behind your favorite creators on MyFAQ.is. Unlock deep, personal questions by supporting creators you love',
    },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const userId = (
    await authenticator.isAuthenticated(args.request, {
      failureRedirect: '/login',
    })
  )?.id;
  const user = await UserRepository.findByUserId(userId!);
  return typedjson({ user });
};

export default function Page() {
  return (
    <MainLayout>
      <NewQuestionForm />
    </MainLayout>
  );
}
