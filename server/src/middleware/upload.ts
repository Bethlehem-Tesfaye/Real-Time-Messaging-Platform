import multer, { type FileFilterCallback } from "multer";
// @ts-expect-error -- no types available for 'multer-storage-cloudinary'
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";
import { cloudinary } from "../lib/cloudinary";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const makeUploader = (folder: string) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: AuthenticatedRequest, _file: Express.Multer.File) => ({
      folder,
      public_id: `${Date.now()}-${req.userId ?? "anonymous"}`
    })
  });

  const fileFilter = (
    req: AuthenticatedRequest,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  });
};
