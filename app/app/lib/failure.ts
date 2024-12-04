import type { STATUS_CODE } from '~/presentation/representers/http-response-representer';

class Failure extends Error {
  status: STATUS_CODE;
  message: string;

  constructor(status: STATUS_CODE, message: string) {
    super(message);

    this.status = status;
    this.message = message;
  }
}

export default Failure;
