import express from "express";
import roomRouter from "../modules/room/room.routes";
import profileRouter from "../modules/profile/profile.routes";

export const router = express.Router();

router.use("/rooms", roomRouter);
router.use("/profile", profileRouter);
