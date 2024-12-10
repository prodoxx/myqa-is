import axios from 'axios';
import { Link } from '@remix-run/react';
import bonk from '~/assets/images/bonk.png';
import { useTypedFetcher } from 'remix-typedjson';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { Input } from '~/ui/atoms/input-field';
import { Label } from '~/ui/atoms/label';
import { Textarea } from '~/ui/atoms/text-area';
import CurrencyInput, {
  CurrencyInputOnChangeValues,
} from 'react-currency-input-field';
import React from 'react';

const getCryptoPrice = async (symbol: string) => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/ticker/price',
      {
        params: {
          symbol: symbol,
        },
      }
    );

    console.log(`${symbol} price: $${response.data.price}`);
    return Number(response.data.price);
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
};

export const NewQuestionForm = () => {
  const fetcherData = useTypedFetcher();
  const isSubmitting = fetcherData.state === 'submitting';

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
      const result = await getCryptoPrice('BONKUSDT');
      if (result) {
        setBonkPrice(result);
        setLastUpdate(new Date().getTime());
      }
    };
    getAndSetPrice();
  }, [price]);

  return (
    <fetcherData.Form>
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
            <Input id="title" name="title" />
          </div>

          <div>
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" name="answer" />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <img src={bonk} alt="BONK" className="h-16 w-16 mr-2" />
              <CurrencyInput
                prefix="BONK "
                decimalsLimit={10}
                allowNegativeValue={false}
                value={price?.float as any}
                onValueChange={(_, __, values) => setPrice(values)}
                className="peer h-16 w-full bg-transparent text-2xl placeholder:text-muted-foreground focus:!outline-none !outline-none !border-none !ring-0"
              />
            </div>

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
            type="button"
            disabled={isSubmitting}
            className="w-1/2"
            asChild
            variant="ghost"
            size="lg"
          >
            <Link to="/dashboard">Cancel</Link>
          </Button>

          <Button
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-1/2"
          >
            Create question
          </Button>
        </CardFooter>
      </Card>
    </fetcherData.Form>
  );
};
