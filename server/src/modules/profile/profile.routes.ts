import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import { makeUploader } from "../../middleware/upload";
import * as profileController from "./profile.controller";
import { updateProfileSchema } from "./profile.schema";

const profileAvatarUploader = makeUploader("blink/profile");

export const profileRouter = express.Router();

profileRouter.get("/me", authMiddleware, profileController.getMyProfile);

profileRouter.put(
  "/me",
  authMiddleware,
  profileAvatarUploader.single("avatar"),
  validate(updateProfileSchema, "body"),
  profileController.upsertMyProfile
);

export default profileRouter;
