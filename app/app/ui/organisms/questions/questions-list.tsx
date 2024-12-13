import { QaDTO } from '~/domain/faq/entities/qa';
import { CryptoPrice } from '~/infrastructure/crypto';
import { Card } from '~/ui/atoms/card';
import { BonkPricing } from '~/ui/molecules/bonk-pricing';
import { UnlockButton } from './unlock-button';
import { ViewAnswerButton } from './view-answer-button';
import { useUser } from '~/provider/user-provider';
import { Button } from '~/ui/atoms/button';
import { Link } from '@remix-run/react';
import { AvailableKeys } from '~/ui/molecules/available-keys';
import { useMarketplace } from '~/hooks/use-marketplace.client';
import React from 'react';
import { Badge } from '~/ui/atoms/badge';
import { Lock } from 'lucide-react';

export type QuestionsListProps = {
  questions?: QaDTO[];
  cryptoPrice: CryptoPrice | null;
  /**
   * Creators can always unlock their question. They don't need to buy it
   */
  isCreator?: boolean;
  decryptedQuestions?: {
    id: number | undefined;
    decryptedAnswer: string;
  }[];
  isDemo?: boolean;
};

export const QuestionsList = ({
  questions,
  cryptoPrice,
  isCreator,
  decryptedQuestions,
  isDemo,
}: QuestionsListProps) => {
  const { user } = useUser();
  const marketplace = useMarketplace();
  const [currentQuestionKeysCountBy, setCurrentQuestionKeysCountBy] =
    React.useState<{ id: number; count: number }[]>([]);

  React.useEffect(() => {
    if (!questions) {
      return;
    }

    const getCurrentKeysCount = async () => {
      const result = await Promise.all(
        questions.map(async (question) => {
          let count = 0;

          try {
            const result = await marketplace.currentKeysCount(
              Number(question.onChainId!)
            );
            count = result as any;
          } catch (error) {
            console.log('Question not found');
          }

          return {
            count,
            id: question.id!,
          };
        })
      );

      setCurrentQuestionKeysCountBy(result);
    };

    getCurrentKeysCount();
  }, [questions]);

  return (
    <>
      {!questions?.length ? (
        <span className="text-gray-400 mx-auto text-sm text-center">
          No questions and answers have been added yet
        </span>
      ) : null}

      <ol className="w-full max-w-4xl mx-auto space-y-4 p-4">
        {questions?.map((question) => (
          <Card
            key={question.id}
            className="p-6 bg-gradient-to-r transition-all duration-300 border border-purple-500/20"
          >
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div className="space-y-4 flex-1 flex-col flex">
                <h3 className="text-xl inline-flex items-center font-bold text-gradient bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {question.question}{' '}
                  {isDemo ? (
                    <Badge variant="outline" className="ml-1">
                      Demo
                    </Badge>
                  ) : null}
                </h3>

                {isDemo && 'author' in question && 'field' in question ? (
                  <div>
                    <span>Asked to {String(question?.author)} in </span>
                    <span className="font-bold">{String(question.field)} </span>
                  </div>
                ) : null}

                <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                  {cryptoPrice ? (
                    <BonkPricing
                      toUsd={Intl.NumberFormat('en-US').format(
                        Number(question.unlockPriceInBonk) * cryptoPrice!.price
                      )}
                    >
                      {question.unlockPriceInBonk.toLocaleString()}
                    </BonkPricing>
                  ) : null}

                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden md:flex" />

                  <AvailableKeys
                    maxKeys={question.maxKeys}
                    currentKeys={
                      currentQuestionKeysCountBy?.find(
                        (c) => c.id === question.id
                      )?.count ?? 0
                    }
                  />
                </div>
              </div>

              {user ? (
                isCreator ? (
                  <ViewAnswerButton
                    id={question.id!}
                    question={question.question}
                    ownerOnlyAnswer={
                      decryptedQuestions?.find((c) => c.id === question.id)
                        ?.decryptedAnswer
                    }
                  />
                ) : (
                  <UnlockButton
                    id={question.id!}
                    onChainId={question.onChainId}
                    question={question.question}
                    priceInBonk={Number(question.unlockPriceInBonk)}
                    priceInDollar={Intl.NumberFormat('en-US').format(
                      Number(question.unlockPriceInBonk) * cryptoPrice!.price
                    )}
                  />
                )
              ) : (
                <Button asChild variant="default">
                  <Link to="/login">
                    <Lock className="mr-2 h-4 w-4" />
                    Login to Unlock Answer
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </ol>
    </>
  );
};
