import * as AvatarBase from '@radix-ui/react-avatar';
import { cn } from '~/lib/utils';

export type AvatarProps = {
  src: string;
  fallback: string;
  className?: string;
};

export const Avatar = ({ src, fallback, className }: AvatarProps) => {
  return (
    <AvatarBase.Root
      className={cn(
        'mr-2 inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full border-indigo-900 bg-slate-50 align-middle',
        className,
      )}
    >
      <AvatarBase.Image className="h-full w-full border-inherit object-cover object-center" src={src} />
      <AvatarBase.Fallback
        className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-bold leading-4 text-indigo-600"
        delayMs={500}
      >
        {fallback}
      </AvatarBase.Fallback>
    </AvatarBase.Root>
  );
};
