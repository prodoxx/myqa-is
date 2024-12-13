import { useFetcher } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '~/lib/utils';
import { Button } from '~/ui/atoms/button';

export const LogoutForm = ({ className }: { className?: string }) => {
  const fetcher = useFetcher();
  const { disconnect, wallet } = useWallet();

  // TODO: does not work
  const handleSubmit = async (e: any) => {
    try {
      await wallet?.adapter.disconnect();
    } catch (error) {
      // If you can't log out of wallet, we need to not retry
      console.error('Failed to log out of wallet');
      return;
    }

    // Only if we're out of the Wallet can we log the user out
    fetcher.submit(null, {
      action: '/logout',
      method: 'POST',
    });
  };

  return (
    <fetcher.Form onSubmit={handleSubmit} className={className}>
      <Button size="lg" type="submit" variant="ghost" className="w-full">
        Log out
      </Button>
    </fetcher.Form>
  );
};
