import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useFetcher } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { OnboardingStep } from '~/domain/faq/entities/user-profile';
import { WalletDTO } from '~/domain/faq/entities/wallet';
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

export type CryptoWalletFormProps = {
  wallet?: WalletDTO;
  errorMessage: string | null;
};

export const CryptoWalletForm = ({
  wallet,
  errorMessage,
}: CryptoWalletFormProps) => {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === 'submitting';

  React.useEffect(() => {
    disconnect();
  }, []);

  return (
    <fetcher.Form
      method="POST"
      action="/onboarding"
      encType="multipart/form-data"
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex space-x-2 items-center">
            Connect your Wallet
            {publicKey ? (
              <CheckBadgeIcon className="text-green-500 h-8 w-8 ml-1" />
            ) : null}
          </CardTitle>
          <CardDescription>
            Connect your crypto wallet to your account in order to purchase
            answers.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col space-y-4">
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
            value={publicKey?.toString()}
            onChange={() => {}}
          />
          <WalletMultiButton disabled={connected} className="w-full" />
        </CardContent>

        <CardFooter className="gap-4">
          <Button
            type="submit"
            disabled={connecting || isSubmitting || !connected}
            className="w-full"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </fetcher.Form>
  );
};
