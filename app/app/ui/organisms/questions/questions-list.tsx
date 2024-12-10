import { XIcon } from 'lucide-react';
import { QuestionDTO } from '~/domain/faq/entities/question';
import { CryptoPrice } from '~/infrastructure/crypto';
import { cn } from '~/lib/utils';
import { Bonk } from '~/ui/atoms/bonk';
import { Button } from '~/ui/atoms/button';
import { BonkPricing } from '~/ui/molecules/bonk-pricing';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/ui/molecules/drawer';

export type QuestionsListProps = {
  questions?: QuestionDTO[];
  cryptoPrice: CryptoPrice | null;
};

export const QuestionsList = ({
  questions,
  cryptoPrice,
}: QuestionsListProps) => {
  const QUESTION_PRICE = 155_000;

  return (
    <ol className="flex flex-col space-y-4">
      {!questions?.length ? (
        <span className="text-gray-400 mx-auto text-sm">
          No questions and answers have been added yet
        </span>
      ) : null}

      {questions?.map((question) => (
        <Drawer fixed={false} modal>
          <li
            className={cn(
              'rounded-xl border shadow-md border-slate-300 p-4 flex flex-row justify-between items-center bg-white'
            )}
          >
            <div className="flex flex-col">
              <h3 className="font-bold text-inherit text-left">
                {question.title}
              </h3>

              {cryptoPrice ? (
                <BonkPricing
                  toUsd={Intl.NumberFormat('en-US').format(
                    cryptoPrice.price * QUESTION_PRICE
                  )}
                >
                  {Intl.NumberFormat('en-US').format(QUESTION_PRICE)}
                </BonkPricing>
              ) : null}
            </div>

            <Button asChild variant="default" className="w-fit">
              <DrawerTrigger>Unlock Answer</DrawerTrigger>
            </Button>
          </li>

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
