import { ObjectId } from "mongodb";
import {
  BadRequestError,
  InternalServerError,
  LighthouseError,
  UnauthorizedError,
} from "./errors";
import { LighthouseErrorMessage } from "./errors/seaport-error";

export const checkState = (
  expression: boolean,
  errorMessage: LighthouseErrorMessage
) => {
  if (!expression) {
    throw BadRequestError(errorMessage);
  }
};

export const checkPermission = (
  expression: boolean,
  errorMessage: LighthouseErrorMessage
) => {
  if (!expression) {
    throw UnauthorizedError(errorMessage);
  }
};

export const assert = (
  expression: boolean,
  errorMessage: LighthouseErrorMessage
) => {
  if (!expression) {
    throw InternalServerError(errorMessage);
  }
};

export function isValidId(id: string): boolean {
  try {
    new ObjectId(id);
    return true;
  } catch (e) {
    return false;
  }
}
