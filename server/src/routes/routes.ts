import express from "express";
import roomRouter from "../modules/room/room.routes";
import profileRouter from "../modules/profile/profile.routes";
import messageRouter from "../modules/message/message.routes";

export const router = express.Router();

router.use("/rooms", roomRouter);
router.use("/profile", profileRouter);
router.use("/messages", messageRouter);
