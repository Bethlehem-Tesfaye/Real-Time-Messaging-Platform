import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController
} from "./notification.controller";
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema
} from "./notification.schema";

const notificationRouter = Router();

notificationRouter.use(authMiddleware);

notificationRouter.get(
  "/",
  validate(listNotificationsQuerySchema, "query"),
  listNotificationsController
);
notificationRouter.patch("/read-all", markAllNotificationsReadController);
notificationRouter.patch(
  "/:id/read",
  validate(notificationIdParamsSchema, "params"),
  markNotificationReadController
);

export default notificationRouter;
