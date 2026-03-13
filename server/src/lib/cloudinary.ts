import { v2 as cloudinary, type ConfigOptions } from "cloudinary";
import { logger } from "../config/logger";
import { env } from "../config/environments";

const cloudinaryConfig: ConfigOptions = {
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
};

cloudinary.config(cloudinaryConfig);

const hasValidConfig =
  !!cloudinaryConfig.cloud_name &&
  !!cloudinaryConfig.api_key &&
  !!cloudinaryConfig.api_secret;

if (!hasValidConfig) {
  logger.warn(
    "Cloudinary credentials not set (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)"
  );
} else {
  (async () => {
    try {
      if (typeof cloudinary.api?.ping === "function") {
        await cloudinary.api.ping();
      } else {
        await cloudinary.api.resources({ max_results: 1 });
      }

      logger.info("Cloudinary connected and reachable");
    } catch (err) {
      logger.error(
        {
          err
        },
        "Cloudinary connection failed"
      );
    }
  })();
}

export { cloudinary };
