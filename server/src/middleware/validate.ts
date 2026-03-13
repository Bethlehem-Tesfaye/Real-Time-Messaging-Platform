import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import CustomError from "../lib/errors";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: z.ZodTypeAny, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      schema.parse(data);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const message = err.issues.map((issue) => issue.message).join(", ");
        next(new CustomError(message, 400));
      } else {
        next(new CustomError("Invalid request data", 400));
      }
    }
  };
