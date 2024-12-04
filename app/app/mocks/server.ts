// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

console.log(`Starting MSW Server in ${process.env.NODE_ENV} environment...`);

// This configures a request mocking server with the given request handlers.
export const mswServer = setupServer(...handlers);
