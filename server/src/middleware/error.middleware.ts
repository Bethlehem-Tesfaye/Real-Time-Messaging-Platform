import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

function isErrWithStatus(e: unknown): e is { statusCode: number } {
  return (
    typeof e === "object" &&
    e !== null &&
    "statusCode" in e &&
    typeof (e as { statusCode: unknown }).statusCode === "number"
  );
}

function extractMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  return "Internal Server Error";
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = isErrWithStatus(err) ? err.statusCode : 500;

  logger.error({ err });

  res.status(statusCode).json({
    message: extractMessage(err),
    stack:
      process.env.NODE_ENV === "development" &&
      typeof err === "object" &&
      err !== null &&
      "stack" in err
        ? (err as { stack?: string }).stack
        : undefined
  });
}
