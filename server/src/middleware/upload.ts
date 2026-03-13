import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { cloudinary } from "../lib/cloudinary";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const makeUploader = (_folder: string) => {
  const storage = multer.memoryStorage();

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

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  userId?: string
) => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${userId ?? "anonymous"}`
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};
