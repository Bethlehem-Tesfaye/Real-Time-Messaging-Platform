import type { NextFunction, Request, Response } from "express";
import CustomError from "../../lib/errors";
import { getRoomMessagesService } from "./message.service";
import type { RoomMessagesParams, RoomMessagesQuery } from "./types";

export const listRoomMessagesController = async (
  req: Request<RoomMessagesParams, unknown, unknown, RoomMessagesQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.roomId);
    const parsedLimit = req.query.limit ? Number(req.query.limit) : 50;

    const messages = await getRoomMessagesService(
      req.userId,
      roomId,
      parsedLimit
    );
    return res.status(200).json(messages);
  } catch (err) {
    return next(err);
  }
};
