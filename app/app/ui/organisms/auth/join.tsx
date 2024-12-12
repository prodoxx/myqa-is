import { Link } from '@remix-run/react';
import { cn } from '~/lib/utils';
import { useUser } from '~/provider/user-provider';
import { Button } from '~/ui/atoms/button';

interface JoinButtonProps {
  username: string;
}

export function JoinButton({ username }: JoinButtonProps) {
  const { user } = useUser();

  if (user) {
    return null;
  }

  return (
    <Button
      asChild
      size="lg"
      className={cn(
        'fixed flex items-center transition-transform hover:shadow-lg hover:scale-110 bottom-8 p-8 rounded-full'
      )}
    >
      <Link to="/register">
        <img src="/logo.svg" className="w-12" />{' '}
        <span className="ml-2">Join @{username} on MyQA.is!</span>
      </Link>
    </Button>
  );
}
