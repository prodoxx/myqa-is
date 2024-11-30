import { useTypedFetcher } from 'remix-typedjson';
import { OnboardUserFormErrors } from '~/domain/faq/services/onboard-user';
import { Button } from '~/ui/atoms/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/ui/atoms/card';
import { ErrorMessage } from '~/ui/atoms/error-message';
import { Input } from '~/ui/atoms/input-field';
import { Label } from '~/ui/atoms/label';
import { Textarea } from '~/ui/atoms/text-area';
import { ImageInput } from '~/ui/molecules/image-input';

export const BasicInformationForm = () => {
  const fetcherData = useTypedFetcher<{ formErrors?: OnboardUserFormErrors }>();
  const formErrors = fetcherData?.data?.formErrors;
  const isSubmitting = fetcherData.state === 'submitting';

  return (
    <fetcherData.Form action="/onboarding" method="POST" encType="multipart/form-data">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <ImageInput name="avatar" error={formErrors?.avatar?.[0]} />

          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" />
            <ErrorMessage message={formErrors?.username?.[0]} />
          </div>

          <div>
            <Label htmlFor="about">Bio</Label>
            <Textarea id="about" name="about" />
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
