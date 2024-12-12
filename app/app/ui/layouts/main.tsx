import React from 'react';
import { cn } from '~/lib/utils';
import { SiteNav } from '../molecules/site-nav';

export const MainLayout = ({
  children,
  className,
  enableBackgroundImage,
  connectedPublicKey,
}: {
  children: React.ReactNode;
  className?: string;
  enableBackgroundImage?: boolean;
  connectedPublicKey?: string;
}) => {
  return (
    <div className="h-full w-full flex-col flex px-4 md:px-20">
      <SiteNav
        connectedPublicKey={
          typeof window !== 'undefined'
            ? window?.ENV?.CONNECTED_PUBLIC_KEY
            : undefined
        }
      />

      <main className={cn('w-full flex-grow flex flex-col', className)}>
        {children}
      </main>
    </div>
  );
};
