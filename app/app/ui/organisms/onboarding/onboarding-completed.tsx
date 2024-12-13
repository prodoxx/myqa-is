import { Link, useNavigate } from '@remix-run/react';
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
import { useUser } from '~/provider/user-provider';
import { useEffect, useState } from 'react';
import { useTypedLoaderData } from 'remix-typedjson';
import { loader } from '~/routes/onboarding';

export const OnboardingComplete = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  const navigate = useNavigate();
  const data = useTypedLoaderData<typeof loader>();
  const { user } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Use the hydrated user data from the loader
    if (data?.user?.username) {
      setIsReady(true);
    }
  }, [data?.user]);

  const handleProfileClick = () => {
    if (data?.user?.username) {
      navigate(`/${data.user.username}`);
    } else {
      navigate('/onboarding?step=BASIC_INFORMATION');
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Completed</CardTitle>
        <span className="text-muted-foreground">
          You've successfully set up your account. You can start adding your
          questions and answers.
        </span>
      </CardHeader>

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
        <Button
          variant="outline"
          className="w-full"
          onClick={handleProfileClick}
          disabled={!isReady}
        >
          Visit Your Profile
        </Button>

        <Button
          className="w-full"
          onClick={() => navigate('/question/new')}
          disabled={!isReady}
        >
          Create a Question & Answer
        </Button>
      </CardFooter>
    </Card>
  );
};
