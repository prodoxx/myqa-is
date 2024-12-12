import { X } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '~/ui/atoms/alert';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/ui/atoms/card';
import { unlockQuestionAndAnswer } from '~/infrastructure/crypto/unlock-qa.client';
import { Bonk } from '~/ui/atoms/bonk';

interface UnlockQuestionFormProps {
  questionId: string;
  question: string;
  priceInBonk: number;
  onClose: () => void;
}

export function UnlockQuestionForm({
  questionId,
  question,
  priceInBonk,
  onClose,
}: UnlockQuestionFormProps) {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    try {
      setIsLoading(true);
      setError('');
      await unlockQuestionAndAnswer();
      onClose();
    } catch (err) {
      console.error('Failed to unlock question', err);
      setError('Failed to unlock the question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Unlock this answer?</CardTitle>
        </div>
        <CardDescription>
          You can pay BONK to unlock the answer to this question. All operations
          are protected by the Solana network.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Question</h3>
          <p className="text-muted-foreground">{question}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Price to unlock</p>
            <p className="text-2xl font-bold">
              {priceInBonk.toLocaleString()} BONK
            </p>
          </div>
          <Bonk className="h-8 w-8" />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex space-x-4">
        <Button
          variant="ghost"
          className="w-1/2"
          onClick={onClose}
          disabled={isLoading}
          size="lg"
        >
          Cancel
        </Button>
        <Button
          className="w-1/2"
          onClick={handleUnlock}
          disabled={!wallet.connected || isLoading}
          isLoading={isLoading}
          size="lg"
        >
          {wallet.connected ? 'Unlock Answer' : 'Connect Wallet'}
        </Button>
      </CardFooter>
    </Card>
  );
}
