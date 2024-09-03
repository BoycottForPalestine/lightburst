import { NextFunction, Request, Response } from "express";

type expressFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncMiddleware =
  (fn: expressFunction) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
