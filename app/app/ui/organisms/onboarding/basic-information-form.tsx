import { useTypedFetcher } from 'remix-typedjson';
import { ClientOnly } from 'remix-utils/client-only';
import { OnboardingStep } from '~/domain/faq/entities/user-profile';
import { OnboardUserFormErrors } from '~/domain/faq/services/onboard-user';
import { Alert, AlertTitle, AlertDescription } from '~/ui/atoms/alert';
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
import { ImageInput } from '~/ui/molecules/image-input';

export const BasicInformationForm = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  const fetcherData = useTypedFetcher<{ formErrors?: OnboardUserFormErrors }>();
  const formErrors = fetcherData?.data?.formErrors;
  const isSubmitting = fetcherData.state === 'submitting';

  return (
    <fetcherData.Form
      action="/onboarding"
      method="POST"
      encType="multipart/form-data"
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-8">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to complete step</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <input
            name="onboarding"
            hidden
            value={OnboardingStep.BASIC_INFORMATION}
            onClick={() => {}}
          />
          <ClientOnly>
            {() => <ImageInput name="avatar" error={formErrors?.avatar?.[0]} />}
          </ClientOnly>

          <div className="space-y-3">
            <Label htmlFor="username" className="text-base">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="Choose a unique username that represents you"
              className="h-12"
            />
            <ErrorMessage message={formErrors?.username?.[0]} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="about" className="text-base">
              Bio
            </Label>
            <Textarea
              id="about"
              name="about"
              placeholder="Share your story, expertise, and what makes you unique..."
              className="min-h-[120px] resize-none"
            />
            <ErrorMessage message={formErrors?.about?.[0]} />
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
