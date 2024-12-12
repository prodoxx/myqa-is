import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, useNavigation } from '@remix-run/react';
import { AuthorizationError } from 'remix-auth';
import { typedjson, useTypedActionData } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import { getErrorMessage } from '~/lib/error-messages';
import { commitSession, getSession } from '~/session.server';
import { Button } from '~/ui/atoms/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/ui/atoms/card';
import { Separator } from '~/ui/atoms/separator';
import { MainLayout } from '~/ui/layouts/main';
import { GoogleLoginForm } from '~/ui/organisms/auth/google-form';
import { LoginForm } from '~/ui/organisms/auth/login-form';

const getValuesFromRequest = async (request: Request) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);

  return values;
};

export const meta: MetaFunction = () => {
  return [
    {
      title: "Log in to MyQA.is | Your Fan's Preferred Way to Get to Know You",
    },
    {
      name: 'description',
      content:
        'Discover the stories behind your favorite creators on MyQA.is. Unlock deep, personal questions by supporting creators you love',
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/dashboard',
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  let headers;
  try {
    const user = await authenticator.authenticate('user-pass', request, {});

    // manually get the session
    const session = await getSession(request.headers.get('cookie'));
    // and store the user data
    session.set(authenticator.sessionKey, user);

    // commit the session
    headers = new Headers({ 'Set-Cookie': await commitSession(session) });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) throw error;
    if (error instanceof AuthorizationError) {
      return typedjson({
        errors: {
          general: getErrorMessage(error),
        },
      });
    }

    return typedjson({
      values: await getValuesFromRequest(request),
      errors: {
        general: getErrorMessage(error),
      },
    });
  }

  throw redirect('/dashboard', { headers });
};

const Login = () => {
  const transition = useNavigation();
  const actionData = useTypedActionData<typeof action>();

  return (
    <MainLayout enableBackgroundImage className="space-y-8 items-center">
      <Card className="w-full md:max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In Now</CardTitle>
          <CardDescription>Start adding your FAQ now!</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col space-y-4">
          <LoginForm
            className="flex flex-col space-y-2"
            isSubmitting={transition.state === 'submitting'}
            errors={actionData?.errors}
            initialValues={{
              email: '',
              password: '',
            }}
          />

          <Separator />
          <GoogleLoginForm />
        </CardContent>
      </Card>

      <Button
        asChild
        type="submit"
        size="lg"
        variant="outline"
        className="!w-full !mx-auto md:!max-w-xl"
      >
        <Link to="/register">Sign Up</Link>
      </Button>
    </MainLayout>
  );
};

export default Login;
