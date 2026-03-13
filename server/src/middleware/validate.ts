import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import CustomError from "../lib/errors";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: z.ZodTypeAny, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const parsedData = schema.parse(data);

      if (target === "body" || target === "params") {
        (req as unknown as Record<"body" | "params", unknown>)[target] =
          parsedData;
      }

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
