import type { NextFunction, Request, Response } from "express";
import CustomError from "../../lib/errors";
import { uploadImageToCloudinary } from "../../middleware/upload";
import {
  createRoomService,
  deleteRoomService,
  getRoomDetailsService,
  getRoomMembershipService,
  joinRoomService,
  leaveRoomService,
  listRoomsService,
  updateRoomService
} from "./room.service";
import type {
  CreateRoomBody,
  ListRoomsQuery,
  RoomIdParams,
  UpdateRoomBody
} from "./types";

export const listRoomsController = async (
  req: Request<unknown, unknown, unknown, ListRoomsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const rooms = await listRoomsService(req.userId, req.query);
    return res.status(200).json(rooms);
  } catch (err) {
    return next(err);
  }
};

export const createRoomController = async (
  req: Request<unknown, unknown, CreateRoomBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const uploadedAvatarUrl = req.file
      ? await uploadImageToCloudinary(req.file, "blink/rooms", req.userId)
      : undefined;

    const room = await createRoomService(req.userId, {
      ...req.body,
      avatarUrl: uploadedAvatarUrl
    });
    return res.status(201).json(room);
  } catch (err) {
    return next(err);
  }
};

export const joinRoomController = async (
  req: Request<RoomIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.id);
    const result = await joinRoomService(req.userId, roomId);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const getRoomDetailsController = async (
  req: Request<RoomIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = Number(req.params.id);
    const room = await getRoomDetailsService(roomId);
    return res.status(200).json(room);
  } catch (err) {
    return next(err);
  }
};

export const updateRoomController = async (
  req: Request<RoomIdParams, unknown, UpdateRoomBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.id);
    const uploadedAvatarUrl = req.file
      ? await uploadImageToCloudinary(req.file, "blink/rooms", req.userId)
      : undefined;

    const room = await updateRoomService(req.userId, roomId, {
      ...req.body,
      avatarUrl: uploadedAvatarUrl ?? req.body.avatarUrl
    });

    return res.status(200).json(room);
  } catch (err) {
    return next(err);
  }
};

export const deleteRoomController = async (
  req: Request<RoomIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.id);
    const response = await deleteRoomService(req.userId, roomId);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const leaveRoomController = async (
  req: Request<RoomIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.id);
    const response = await leaveRoomService(req.userId, roomId);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const getRoomMembershipController = async (
  req: Request<RoomIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new CustomError("Unauthorized user", 401);
    }

    const roomId = Number(req.params.id);
    const response = await getRoomMembershipService(req.userId, roomId);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};
