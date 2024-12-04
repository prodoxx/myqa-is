import { Link } from '@remix-run/react';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/ui/atoms/breadcrumbs';

export type BreadcrumbsProps = {
  items: { label: string; href: string }[];
} & React.HTMLAttributes<HTMLDivElement>;
export const Breadcrumbs = ({ items, ...props }: BreadcrumbsProps) => {
  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <>
            {index !== items.length - 1 ? (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            ) : (
              <React.Fragment key={item.href}>
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
