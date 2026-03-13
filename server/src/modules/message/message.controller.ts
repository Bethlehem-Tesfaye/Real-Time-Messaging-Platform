import type { NextFunction, Request, Response } from "express";
import CustomError from "../../lib/errors";
import { emitRoomMessage } from "../../socket";
import { createMessageNotificationsService } from "../notification/notification.service";
import {
  createMessageService,
  getRoomMessagesService
} from "./message.service";
import type {
  CreateRoomMessageBody,
  RoomMessagesParams,
  RoomMessagesQuery
} from "./types";

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

export const createRoomMessageController = async (
  req: Request<RoomMessagesParams, unknown, CreateRoomMessageBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.roomId);
    const createdMessage = await createMessageService(
      req.userId,
      roomId,
      req.body.content
    );
    await createMessageNotificationsService({
      senderId: createdMessage.senderId,
      senderName: createdMessage.senderName,
      roomId: createdMessage.roomId,
      messageId: createdMessage.id,
      content: createdMessage.content
    });
    emitRoomMessage(roomId, createdMessage);

    return res.status(201).json(createdMessage);
  } catch (err) {
    return next(err);
  }
};
