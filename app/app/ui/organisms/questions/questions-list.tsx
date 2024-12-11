import { Lock, XIcon } from 'lucide-react';
import { QaDTO } from '~/domain/faq/entities/question';
import { CryptoPrice } from '~/infrastructure/crypto';
import { Bonk } from '~/ui/atoms/bonk';
import { Button } from '~/ui/atoms/button';
import { Card } from '~/ui/atoms/card';
import { BonkPricing } from '~/ui/molecules/bonk-pricing';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/ui/molecules/drawer';

export type QuestionsListProps = {
  questions?: QaDTO[];
  cryptoPrice: CryptoPrice | null;
};

export const QuestionsList = ({
  questions,
  cryptoPrice,
}: QuestionsListProps) => {
  return (
    <ol className="w-full max-w-4xl mx-auto space-y-4 p-4">
      {!questions?.length ? (
        <span className="text-gray-400 mx-auto text-sm">
          No questions and answers have been added yet
        </span>
      ) : null}

      {questions?.map((question) => (
        <Drawer fixed={false} modal>
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
                  <BonkPricing
                    toUsd={Intl.NumberFormat('en-US').format(
                      Number(question.unlockPriceInBonk) * cryptoPrice!.price
                    )}
                  >
                    {question.unlockPriceInBonk.toLocaleString()}
                  </BonkPricing>

                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />

                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {question.currentKeys}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                      {question.maxKeys}
                    </span>{' '}
                    keys sold
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="default"
                className={`relative w-fit overflow-hidden bg-purple-500 hover:bg-purple-600`}
              >
                <DrawerTrigger>
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock Answer
                  </>
                </DrawerTrigger>
              </Button>
            </div>
          </Card>

          <DrawerContent className="max-w-4xl mx-auto min-h-96">
            <DrawerHeader>
              <div className="flex flex-row justify-between items-center">
                <DrawerTitle className="text-2xl">
                  Unlock the answer to this question?
                </DrawerTitle>
                <DrawerClose>
                  <Button variant="ghost" size="icon" className="!rounded-full">
                    <XIcon />
                  </Button>
                </DrawerClose>
              </div>

              <DrawerDescription className="text-gray-500">
                You can pay BONK to unlock the answer to this question. All
                operations are protected by the Solana network.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4">{/*  */}</div>
          </DrawerContent>
        </Drawer>
      ))}
    </ol>
  );
};
