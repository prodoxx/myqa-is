import { CheckCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export enum ListItemAppearance {
  Default,
  Primary,
  Secondary,
}

export type ListChildren = ReactNode | string;

export type ListItemsProps = {
  appearance: ListItemAppearance;
  children: ListChildren;
};

export const ListItem = ({ children, appearance }: ListItemsProps) => {
  return (
    <li
      className={clsx('inline-flex list-none items-center', {
        'text-primary-4': appearance === ListItemAppearance.Primary,
        'text-neutral-2': appearance === ListItemAppearance.Secondary,
      })}
    >
      {appearance === ListItemAppearance.Primary ? (
        <CheckCircleIcon className="mr-2 h-4 w-4 text-primary-1" />
      ) : appearance === ListItemAppearance.Secondary ? (
        <CheckIcon className="mr-2 h-4 w-4" />
      ) : null}
      <div>{children}</div>
    </li>
  );
};
