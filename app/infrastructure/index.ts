import { setupWorker } from 'msw/browser';
import { handlers } from '~/mocks/handlers';

const worker = setupWorker(...handlers);

export const mock = {
  start: () => {
    worker.start({
      onUnhandledRequest: 'warn',
    });
  },
};
