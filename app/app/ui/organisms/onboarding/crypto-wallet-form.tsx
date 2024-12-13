import { useFetcher } from '@remix-run/react';
import { useWalletState } from '~/provider/wallet-provider';
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { OnboardingStep } from '~/domain/faq/entities/user-profile';
import { Alert, AlertDescription, AlertTitle } from '~/ui/atoms/alert';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { CheckCircle2 } from 'lucide-react';
import { Transaction, Connection } from '@solana/web3.js';

export type CryptoWalletFormProps = {
  errorMessage: string | null;
};

export const CryptoWalletForm = ({ errorMessage }: CryptoWalletFormProps) => {
  const {
    isConnected,
    isConnecting,
    hasPermission,
    disconnectWallet,
    connectWallet,
    walletAddress,
  } = useWalletState();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  React.useEffect(() => {
    // Disconnect wallet when component mounts to ensure fresh connection
    disconnectWallet();
  }, []);

  return (
    <fetcher.Form
      method="POST"
      action="/onboarding"
      encType="multipart/form-data"
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl">Connect your Wallet</CardTitle>
          <CardDescription>
            Connect your crypto wallet to your account to participate.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4 pb-12">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to complete step</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <input
            hidden
            name="onboarding"
            value={OnboardingStep.CRYPTO_WALLET}
            onChange={() => {}}
          />
          <input
            hidden
            name="publicKey"
            value={walletAddress || ''}
            onChange={() => {}}
          />

          <div className="flex flex-col items-center space-y-4 w-full">
            <WalletMultiButton
              className="!bg-primary hover:!bg-primary/90 !h-11 !px-8"
              onClick={connectWallet}
            >
              {isConnected ? 'Change Wallet' : 'Connect Wallet'}
            </WalletMultiButton>

            {isConnected && hasPermission && (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Connected</span>
                </div>
                <code className="rounded-md border border-input/20 bg-black/40 px-4 py-2 font-mono text-sm font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  {walletAddress}
                </code>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="gap-4 pt-4">
          <Button
            type="submit"
            disabled={
              isConnecting || isSubmitting || !isConnected || !hasPermission
            }
            className="w-full"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </fetcher.Form>
  );
};
