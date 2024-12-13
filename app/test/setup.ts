import { mswServer } from '~/mocks/server';

mswServer.listen({ onUnhandledRequest: 'warn' });
