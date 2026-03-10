import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import { listRoomMessagesController } from "./message.controller";
import {
  roomMessagesParamsSchema,
  roomMessagesQuerySchema
} from "./message.schema";

const messageRouter = Router();

messageRouter.use(authMiddleware);
messageRouter.get(
  "/rooms/:roomId",
  validate(roomMessagesParamsSchema, "params"),
  validate(roomMessagesQuerySchema, "query"),
  listRoomMessagesController
);

export default messageRouter;
