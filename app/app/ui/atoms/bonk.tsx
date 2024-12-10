import bonk from '~/assets/images/bonk.png';
import { cn } from '~/lib/utils';

export const Bonk = ({ className }: { className?: string }) => {
  return (
    <img src={bonk} alt="BONK" className={cn('h-16 w-16 mr-2', className)} />
  );
};
