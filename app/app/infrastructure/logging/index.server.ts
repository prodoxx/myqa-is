import pino from 'pino';
import pinoPretty from 'pino-pretty';
import logtail from '@logtail/pino';

const token = process.env.BETTER_STACK_LOGS;

const getLogger = async () => {
  let logTail;
  if (process.env.NODE_ENV === 'production') {
    const setLogTail = async () => {
      logTail = await logtail({ sourceToken: token!, options: {} });
    };

    setLogTail();
  }

  const logger = pino({ base: null }, process.env.NODE_ENV === 'production' ? logTail : pinoPretty({ sync: true }));
  return logger;
};

export const logger = await getLogger();
