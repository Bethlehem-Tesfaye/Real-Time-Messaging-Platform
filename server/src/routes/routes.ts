import express from "express";
import roomRouter from "../modules/room/room.routes";
import profileRoutes from "../modules/profile/profile.routes";
import messageRouter from "../modules/message/message.routes";
import notificationRouter from "../modules/notification/notification.routes";

export const router = express.Router();

router.use("/rooms", roomRouter);
router.use("/profile", profileRoutes);
router.use("/messages", messageRouter);
router.use("/notifications", notificationRouter);
