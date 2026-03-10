import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import { makeUploader } from "../../middleware/upload";
import {
  createRoomController,
  deleteRoomController,
  getRoomDetailsController,
  getRoomMembershipController,
  joinRoomController,
  leaveRoomController,
  listRoomsController,
  updateRoomController
} from "./room.controller";
import {
  createRoomSchema,
  listRoomsQuerySchema,
  roomIdParamsSchema,
  updateRoomSchema
} from "./room.schema";

const roomRouter = Router();
const roomAvatarUploader = makeUploader("blink/rooms");

roomRouter.use(authMiddleware);

roomRouter.get(
  "/",
  validate(listRoomsQuerySchema, "query"),
  listRoomsController
);
roomRouter.post(
  "/",
  roomAvatarUploader.single("avatar"),
  validate(createRoomSchema),
  createRoomController
);
roomRouter.post(
  "/:id/join",
  validate(roomIdParamsSchema, "params"),
  joinRoomController
);
roomRouter.post(
  "/:id/leave",
  validate(roomIdParamsSchema, "params"),
  leaveRoomController
);
roomRouter.get(
  "/:id/membership",
  validate(roomIdParamsSchema, "params"),
  getRoomMembershipController
);
roomRouter.get(
  "/:id",
  validate(roomIdParamsSchema, "params"),
  getRoomDetailsController
);
roomRouter.put(
  "/:id",
  validate(roomIdParamsSchema, "params"),
  roomAvatarUploader.single("avatar"),
  validate(updateRoomSchema),
  updateRoomController
);
roomRouter.delete(
  "/:id",
  validate(roomIdParamsSchema, "params"),
  deleteRoomController
);

export default roomRouter;
