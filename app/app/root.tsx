import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from '@remix-run/react';
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import '~/assets/styles/app.css';
import { authenticator } from './auth.server';
import { getDomainUrl } from './infrastructure/analytics/seo';
import { PHProvider } from './provider/posthog-provider';
import { UserProvider } from './provider/user-provider';
import { TooltipProvider } from './ui/atoms/tooltip';
import { SolanaProvider } from '~/ui/organisms/providers/solana-provider';
import { useEffect } from 'react';
import { posthog } from './infrastructure/analytics/index.client';
import sonnerStyles from 'sonner/dist/styles.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: sonnerStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {});

  return typedjson({
    user,
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
    ENV: {
      CONNECTED_PUBLIC_KEY: user?.walletPublicKey,
      SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'devnet',
      SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || '',
      MARKETPLACE_PROGRAM_ID: process.env.MARKETPLACE_PROGRAM_ID,
      MARKETPLACE_AUTHORITY_PUBLIC_KEY:
        process.env.MARKETPLACE_AUTHORITY_PUBLIC_KEY,
    },
  });
};

export const meta: MetaFunction = () => {
  return [
    {
      title: "MyQA.is | Your Fan's Preferred Way to Get to Know You",
    },
    {
      name: 'description',
      content:
        'Discover the stories behind your favorite creators on MyQA.is. Unlock deep, personal questions by supporting creators you love',
    },
  ];
};

export default function App() {
  const data = useTypedLoaderData<typeof loader>();

  const location = useLocation();
  useEffect(() => {
    posthog.capture('$pageview');
  }, [location]);

  return (
    <html lang="en" className="h-full w-full dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.cdnfonts.com"></link>
        <link
          href="https://fonts.cdnfonts.com/css/linik-sans"
          rel="stylesheet"
        ></link>
      </head>

      <body className="h-full w-full flex min-h-screen flex-col font-sans">
        <SolanaProvider
          SOLANA_NETWORK={data.ENV.SOLANA_NETWORK}
          RPC_ENDPOINT={data.ENV.SOLANA_RPC_URL}
        >
          <UserProvider user={data?.user || undefined}>
            <TooltipProvider>
              <PHProvider>
                <Outlet />
              </PHProvider>
            </TooltipProvider>
          </UserProvider>
        </SolanaProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
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
            We're sorry, but an unexpected error has occurred. Please try again
            later or contact support if the issue persists. The cause of the
            error is{' '}
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
