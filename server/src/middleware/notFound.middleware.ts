import type { Request, Response, NextFunction } from "express";

interface OperationalError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  ) as OperationalError;
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}
