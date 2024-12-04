// import { installGlobals } from '@remix-run/node';
import { mswServer } from '~/mocks/server';

// installGlobals();

mswServer.listen({ onUnhandledRequest: 'warn' });
