import React from 'react';
import { cn } from '~/lib/utils';
import { SiteNav } from '../molecules/site-nav';

export const MainLayout = ({
  disableSiteNav = false,
  children,
  className,
  enableBackgroundImage,
  connectedPublicKey,
  backgroundClassName,
}: {
  disableSiteNav?: boolean;
  children: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  enableBackgroundImage?: boolean;
  connectedPublicKey?: string;
}) => {
  return (
    <div
      className={cn(
        'h-full w-full overflow-y-scroll flex-col flex px-4 md:px-20',
        backgroundClassName
      )}
    >
      {disableSiteNav ? null : (
        <SiteNav
          connectedPublicKey={
            typeof window !== 'undefined'
              ? window?.ENV?.CONNECTED_PUBLIC_KEY
              : undefined
          }
        />
      )}

      <main
        className={cn(
          'w-full flex-grow flex flex-col h-[calc(100%-100px)]',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};
