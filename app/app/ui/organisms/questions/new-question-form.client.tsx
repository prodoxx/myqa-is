import { Form, useNavigate } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { noop } from 'lodash';
import omit from 'lodash/omit';
import React from 'react';
import CurrencyInput, {
  CurrencyInputOnChangeValues,
} from 'react-currency-input-field';
import { useRemixForm } from 'remix-hook-form';
import { useMarketplace } from '~/hooks/use-marketplace.client';
import { getCryptoPrice, SupportedCoins } from '~/infrastructure/crypto';
import {
  createQuestionAndAnswer,
  CreateQuestionAndAnswerFormData,
  createQuestionAndAnswerFormDataResolver,
} from '~/infrastructure/crypto/create-qa.client';
import { Bonk } from '~/ui/atoms/bonk';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { ErrorMessage } from '~/ui/atoms/error-message';
import { Input } from '~/ui/atoms/input-field';
import { Label } from '~/ui/atoms/label';
import { Textarea } from '~/ui/atoms/text-area';

export const NewQuestionForm = () => {
  const marketplace = useMarketplace();
  const wallet = useWallet();

  const [price, setPrice] = React.useState<
    CurrencyInputOnChangeValues | undefined
  >(undefined);
  const [bonkPrice, setBonkPrice] = React.useState<number | undefined>(
    undefined
  );
  const [lastUpdate, setLastUpdate] = React.useState<number>(
    new Date().getTime()
  );
  const priceOfBonkInUSD =
    typeof price !== 'undefined' && typeof bonkPrice !== 'undefined'
      ? bonkPrice * price.float!
      : null;

  React.useEffect(() => {
    const getAndSetPrice = async () => {
      const result = await getCryptoPrice(SupportedCoins.BONKUSDT);
      if (result) {
        setBonkPrice(result.price);
        setLastUpdate(result.date);
      }
    };
    getAndSetPrice();
  }, [price]);

  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
    setValue,
    register,
  } = useRemixForm<CreateQuestionAndAnswerFormData>({
    defaultValues: {
      maxKeys: 1,
    },
    mode: 'onSubmit',
    resolver: createQuestionAndAnswerFormDataResolver,
    submitHandlers: {
      onValid: async (values) => {
        try {
          await createQuestionAndAnswer({
            values,
            marketplace: marketplace as any,
            wallet: {} as any,
          });
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Failed to create');
        }
      },
    },
  });

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a new question</CardTitle>
          <span className="text-gray-500">
            A new question will be created and minted on the blockchain. Your
            fans can then pay to unlock your question's answer.
          </span>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              disabled={isLoading || isSubmitting}
              className="!text-lg h-14"
              {...register('question')}
            />
            <ErrorMessage message={errors.question?.message} />
          </div>

          <div>
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              disabled={isLoading || isSubmitting}
              className="!text-lg"
              {...register('answer')}
            />
            <ErrorMessage message={errors.answer?.message} />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="answer">Max Keys</Label>
            <Input
              className="!text-lg h-14 disabled:cursor-not-allowed disabled:opacity-50"
              type="number"
              disabled={isLoading || isSubmitting}
              {...register('maxKeys', { valueAsNumber: true })}
            />
            <ErrorMessage message={errors.maxKeys?.message} />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="unlockPriceInBonk">Price to Unlock</Label>
            <div className="flex flex-row items-center rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:border-ring disabled:cursor-not-allowed disabled:opacity-50">
              <Bonk />
              <CurrencyInput
                prefix="BONK "
                decimalsLimit={10}
                allowNegativeValue={false}
                value={price?.float as any}
                disabled={isLoading || isSubmitting}
                onValueChange={(_, __, values) => {
                  setPrice(values);
                  setValue('unlockPriceInBonk', BigInt(values?.float!));
                }}
                className="peer h-16 w-full bg-transparent text-2xl placeholder:text-muted-foreground focus:!outline-none !outline-none !border-none !ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                {...omit(register('unlockPriceInBonk'), ['onChange', 'onBlur'])}
              />
            </div>

            <ErrorMessage message={errors.unlockPriceInBonk?.message} />

            {typeof price !== 'undefined' ? (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  {price.formatted}≈USDT
                  {priceOfBonkInUSD?.toFixed(2) === '0.00'
                    ? priceOfBonkInUSD?.toFixed(6)
                    : priceOfBonkInUSD?.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Last update: {new Date(lastUpdate).toDateString()} at{' '}
                  {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex space-x-4">
          <Button
            size="lg"
            type="button"
            disabled={isLoading || isSubmitting}
            className="w-1/2"
            variant="ghost"
            // onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>

          <Button
            size="lg"
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-1/2"
          >
            Create question
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
};
