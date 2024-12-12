import { QaDTO } from '~/domain/faq/entities/question';
import { CryptoPrice } from '~/infrastructure/crypto';
import { Card } from '~/ui/atoms/card';
import { BonkPricing } from '~/ui/molecules/bonk-pricing';
import { UnlockButton } from './unlock-button';
import { ViewAnswerButton } from './view-answer-button';
import { useUser } from '~/provider/user-provider';
import { Button } from '~/ui/atoms/button';
import { Link } from '@remix-run/react';
import { AvailableKeys } from '~/ui/molecules/available-keys';

export type QuestionsListProps = {
  questions?: QaDTO[];
  cryptoPrice: CryptoPrice | null;
  /**
   * Creators can always unlock their question. They don't need to buy it
   */
  isCreator?: boolean;
};

export const QuestionsList = ({
  questions,
  cryptoPrice,
  isCreator,
}: QuestionsListProps) => {
  const { user } = useUser();

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
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {question.question}
                </h3>

                <div className="flex items-center gap-4">
                  {cryptoPrice ? (
                    <BonkPricing
                      toUsd={Intl.NumberFormat('en-US').format(
                        Number(question.unlockPriceInBonk) * cryptoPrice!.price
                      )}
                    >
                      {question.unlockPriceInBonk.toLocaleString()}
                    </BonkPricing>
                  ) : null}

                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />

                  <AvailableKeys
                    maxKeys={question.maxKeys}
                    currentKeys={question.currentKeys}
                  />
                </div>
              </div>

              {user ? (
                Math.random() >= 0.5 || isCreator ? (
                  <ViewAnswerButton
                    id={question.id!}
                    question={question.question}
                  />
                ) : (
                  <UnlockButton
                    id={question.id!}
                    question={question.question}
                    priceInBonk={Number(question.unlockPriceInBonk)}
                    priceInDollar={Intl.NumberFormat('en-US').format(
                      Number(question.unlockPriceInBonk) * cryptoPrice!.price
                    )}
                  />
                )
              ) : (
                <Button asChild variant="default">
                  <Link to="/login">Login to Unlock Answer</Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </ol>
    </>
  );
};
