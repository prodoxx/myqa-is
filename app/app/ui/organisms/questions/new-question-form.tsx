import { Link } from '@remix-run/react';
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
import CurrencyInput from 'react-currency-input-field';

export const NewQuestionForm = () => {
  const fetcherData = useTypedFetcher();
  const isSubmitting = fetcherData.state === 'submitting';

  return (
    <fetcherData.Form>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a new question</CardTitle>
          <span className='text-gray-500'>
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

          <div>
            <CurrencyInput prefix="ETH" decimalsLimit={100000} allowNegativeValue={false}  />;
          </div>
        </CardContent>
        <CardFooter className="flex space-x-4">
          <Button
            type="button"
            disabled={isSubmitting}
            className="w-1/2"
            asChild
            variant="ghost"
          >
            <Link to="/profile">Cancel</Link>
          </Button>

          <Button type="submit" disabled={isSubmitting} className="w-1/2">
            Create question
          </Button>
        </CardFooter>
      </Card>
    </fetcherData.Form>
  );
};
