import type { NextFunction, Request, Response } from "express";
import CustomError from "../../lib/errors";
import {
  listNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService
} from "./notification.service";
import type { ListNotificationsQuery, NotificationIdParams } from "./types";

export const listNotificationsController = async (
  req: Request<unknown, unknown, unknown, ListNotificationsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const notifications = await listNotificationsService(req.userId, req.query);
    return res.status(200).json(notifications);
  } catch (err) {
    return next(err);
  }
};

export const markNotificationReadController = async (
  req: Request<NotificationIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const notificationId = Number(req.params.id);
    const result = await markNotificationReadService(
      req.userId,
      notificationId
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const markAllNotificationsReadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const result = await markAllNotificationsReadService(req.userId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};
