import { Request, Response, NextFunction } from "express";
import { asyncMiddleware } from "./async";
import { BadRequestError } from "../common/errors";
import { LighthouseErrorMessage } from "../common/errors/lighthouse-error";

export function organizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const path = req.path;
  const apiPathParts = path.split("/");

  if (apiPathParts[1] === "api" && apiPathParts.length < 3) {
    throw BadRequestError(LighthouseErrorMessage.GATEWAY_INVALID_URL);
  }

  const organizationId = apiPathParts[3];

  req.organizationId = organizationId;

  return next();
}
