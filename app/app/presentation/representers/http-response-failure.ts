import { json } from '@remix-run/node';
import { getErrorMessage } from '~/lib/error-messages';
import Failure from '~/lib/failure';
import { HTTP_CODE } from './http-response-representer';
import { typedjson } from 'remix-typedjson';

export const getFormattedFailureResponse = (e: unknown, request?: Request) => {
  if (e instanceof Failure) {
    console.error(e.message, request);
    return typedjson({ message: e.message }, HTTP_CODE[e.status]);
  } else {
    console.error(getErrorMessage(e), request);
    return typedjson({ message: `There was an unexpected error: ${getErrorMessage(e)}` }, HTTP_CODE.internal_error);
  }
};
