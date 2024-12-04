import { Outlet } from '@remix-run/react';
import { MainLayout } from '~/ui/layouts/main';

const Page = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default Page;
