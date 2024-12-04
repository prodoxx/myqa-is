import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import '~/assets/styles/app.css';
import { authenticator } from './auth.server';
import { getDomainUrl } from './infrastructure/analytics/seo';
import { PHProvider } from './provider/posthog-provider';
import { UserProvider } from './provider/user-provider';
import { TooltipProvider } from './ui/atoms/tooltip';
import { SolanaWalletProvider } from '~/provider/solana-wallet-provider';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {});

  return typedjson({
    user,
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
  });
};

export const meta: MetaFunction = () => {
  return [{ title: 'Zelo | Running tools for runners by runners' }];
};

export default function App() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>

        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        ></link>
      </head>

      <body className="h-full w-full flex min-h-screen flex-col bg-muted/40 font-sans">
        <SolanaWalletProvider>
          <UserProvider user={data?.user || undefined}>
            <TooltipProvider>
              <PHProvider>
                <Outlet />
              </PHProvider>
            </TooltipProvider>
          </UserProvider>
        </SolanaWalletProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en" className="h-full w-full">
      <head>
        <title>Something went wrong!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Oops, something went wrong!
          </h1>
          <p className="mt-4 text-muted-foreground">
            We're sorry, but an unexpected error has occurred. Please try again later or contact support if the issue
            persists. The cause of the error is{' '}
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : error instanceof Error
                ? error.message
                : 'Unknown Error'}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
