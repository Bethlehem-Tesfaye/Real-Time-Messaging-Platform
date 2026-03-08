import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../modules/auth/auth";

type SessionUser = {
  id?: string;
  [key: string]: unknown;
};

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      userId?: string;
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = (await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    })) as { user?: SessionUser } | undefined;

    const user = session?.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    req.user = user;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized user" });
    }
    req.userId = user.id as string | undefined;
    return next();
  } catch (err: unknown) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;
