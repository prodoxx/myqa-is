import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { Form, useNavigate } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '~/provider/user-provider';
import { Button } from '~/ui/atoms/button';
import { NavLogo } from '~/ui/atoms/nav-logo';

export const SiteNav = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { publicKey } = useWallet();

  return (
    <nav className={`flex h-[96px] w-full flex-row items-center ${className}`}>
      <div className="mr-auto">
        <NavLogo isLink size="large" />
      </div>

      <div className="ml-auto hidden items-center gap-4 sm:flex">
        {user ? (
          <>
            {publicKey ? (
              <span className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">
                {publicKey.toString()}
              </span>
            ) : (
              <WalletMultiButton />
            )}
            <Form action="/logout" method="POST">
              <Button size="lg" variant="default" className="!bg-gray-900 !text-white !w-fit !mx-auto">
                Log out
              </Button>
            </Form>
          </>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            variant="default"
            className="!bg-gray-900 !text-white !w-fit !mx-auto"
          >
            Log in <ArrowLongRightIcon className="text-white h-8 w-10" />
          </Button>
        )}
      </div>
    </nav>
  );
};
