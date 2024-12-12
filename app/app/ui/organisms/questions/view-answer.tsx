import React, { useState } from 'react';
import { viewQuestionAnswer } from '~/infrastructure/crypto/view-answer.client';
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
  questionId: string;
  question: string;
  onClose: () => void;
}

export function ViewAnswer({ questionId, question, onClose }: ViewAnswerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');

  React.useEffect(() => {
    const loadAndSaveAnswer = async () => {
      try {
        setAnswer('');
        setIsLoading(true);
        setError('');
        const answer = await viewQuestionAnswer();
        setAnswer(answer);
      } catch (err) {
        console.error('Failed to view question', err);
        setError('Failed to view the question. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAndSaveAnswer();
  }, [question, questionId]);

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
            ) : (
              <>
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
              </>
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
