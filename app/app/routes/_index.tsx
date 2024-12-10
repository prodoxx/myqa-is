import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { redirect } from 'remix-typedjson';
import { MainLayout } from '~/ui/layouts/main';

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
  return redirect('/dashboard');
};

export default function Index() {
  return <MainLayout>{null}</MainLayout>;
}
