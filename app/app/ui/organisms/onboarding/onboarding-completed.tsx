import { Link } from '@remix-run/react';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/ui/atoms/alert';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';

export const OnboardingComplete = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardTitle>
        <CardHeader>
          <CardTitle className="text-2xl">Profile Completed</CardTitle>
          <span className="text-gray-600 font-normal">
            You've successfully set up your account. You can start adding your
            questions and answers.
          </span>
        </CardHeader>
      </CardTitle>
      <CardContent>
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to complete step</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Added your username and profile picture
          </li>

          <li className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Wrote your bio
          </li>

          <li className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Added your social links
          </li>
        </ul>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="w-full">
          <Link to="/profile">Visit Your Profile</Link>
        </Button>

        <Button asChild className="w-full">
          <Link to="/question/new">Create a Question & Answer</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
