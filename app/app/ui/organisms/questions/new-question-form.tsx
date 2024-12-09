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

export const NewQuestionForm = () => {
  const fetcherData = useTypedFetcher();
  const isSubmitting = fetcherData.state === 'submitting';

  return (
    <fetcherData.Form>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a new question</CardTitle>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            Next
          </Button>
        </CardFooter>
      </Card>
    </fetcherData.Form>
  );
};
