import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import {
  createRoomMessageController,
  listRoomMessagesController
} from "./message.controller";
import {
  createRoomMessageBodySchema,
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

messageRouter.post(
  "/rooms/:roomId",
  validate(roomMessagesParamsSchema, "params"),
  validate(createRoomMessageBodySchema, "body"),
  createRoomMessageController
);

export default messageRouter;
