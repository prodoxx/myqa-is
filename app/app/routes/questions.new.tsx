import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { Card } from '~/ui/atoms/card';
import { MainLayout } from '~/ui/layouts/main';
import { NewQuestionForm } from '~/ui/organisms/questions/new-question-form';

export const meta: MetaFunction = () => {
  return [
    { title: 'Create a new question | MyFAQ.is' },
    { name: 'description', content: 'Create your questions' },
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
