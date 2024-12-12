import { AxiosError } from 'axios';
import { R } from 'node_modules/msw/lib/core/HttpResponse-DzhqZzTK';
import React, { useState } from 'react';
import { viewQuestionAnswer } from '~/infrastructure/crypto/view-answer.client';
import { getErrorMessage } from '~/lib/error-messages';
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
import { Skeleton } from '~/ui/atoms/skeleton';

interface ViewAnswerProps {
  questionId: number;
  question: string;
  onClose: () => void;
  ownerOnlyAnswer?: string;
}

export function ViewAnswer({
  questionId,
  question,
  onClose,
  ownerOnlyAnswer,
}: ViewAnswerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');

  React.useEffect(() => {
    if (ownerOnlyAnswer) {
      setAnswer(ownerOnlyAnswer);
      return;
    }

    const loadAndSaveAnswer = async () => {
      try {
        setAnswer('');
        setIsLoading(true);
        setError('');
        const { answer: decryptedAnswer } =
          await viewQuestionAnswer(questionId);
        setAnswer(decryptedAnswer);
      } catch (error) {
        console.error('Failed to view question', getErrorMessage(error));
        if (error instanceof AxiosError) {
          setError(error.response?.data?.error);
        } else {
          setError(getErrorMessage(error));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAndSaveAnswer();
  }, [question, questionId, ownerOnlyAnswer]);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-normal">
            Unlocked Question
          </CardTitle>
        </div>
        <CardDescription>
          You have previously unlocked the answer to this question
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Question</h3>
          <p className="text-muted-foreground">{question}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1 w-full">
            <p className="text-sm font-medium">Answer</p>
            {answer ? (
              <p className="text-2xl font-bold">{answer}</p>
            ) : !error ? (
              <>
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
              </>
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </div>
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
          disabled={isLoading}
          onClick={onClose}
          size="lg"
          className="w-full"
        >
          Close QA
        </Button>
      </CardFooter>
    </Card>
  );
}
