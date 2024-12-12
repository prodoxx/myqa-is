import { useFetcher } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '~/ui/atoms/button';

export const LogoutForm = () => {
  const fetcher = useFetcher();
  const { disconnect, wallet } = useWallet();

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

    console.log(wallet?.adapter);
  };

  return (
    <>
      {console.log(wallet)}
      <fetcher.Form onSubmit={handleSubmit}>
        <Button
          size="lg"
          variant="default"
          className="!bg-gray-900 !text-white !w-fit !mx-auto"
        >
          Log out
        </Button>
      </fetcher.Form>
    </>
  );
};