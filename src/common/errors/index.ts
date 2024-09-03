import HttpStatusCode from "./http-status-code";
import { LighthouseErrorMessage } from "./lighthouse-error";

export class LighthouseError extends Error {
  cause: Error | null;
  httpCode: HttpStatusCode;

  constructor(httpCode: HttpStatusCode, message: LighthouseErrorMessage) {
    super(message);

    this.httpCode = httpCode;
    this.cause = null;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    Error.captureStackTrace(this, this.constructor);
  }

  getHttpCode() {
    return this.httpCode;
  }
}

export const BadRequestError = (message: LighthouseErrorMessage) =>
  new LighthouseError(HttpStatusCode.BAD_REQUEST, message);
export const UnauthorizedError = (message: LighthouseErrorMessage) =>
  new LighthouseError(HttpStatusCode.UNAUTHORIZED, message);
export const NotFoundError = (message: LighthouseErrorMessage) =>
  new LighthouseError(HttpStatusCode.NOT_FOUND, message);
export const InternalServerError = (message: LighthouseErrorMessage) =>
  new LighthouseError(HttpStatusCode.INTERNAL_SERVER_ERROR, message);
