import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
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
  return null;
};

export default function Index() {
  return <MainLayout>{null}</MainLayout>;
}
