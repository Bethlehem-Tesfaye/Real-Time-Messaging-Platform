import "dotenv/config";
import "./lib/cloudinary";
import app from "./config/app";
import { logger } from "./config/logger";
import { env } from "./config/environments";
import conn from "./config/db";

const PORT = Number(env.PORT) || 5000;

conn
  .query("SELECT 1")
  .then(() => {
    logger.info("database connected");
    app.listen(PORT, () => {
      logger.info(`Server running on port:${PORT}`);
    });
  })
  .catch(() => {
    logger.error("database connection failed");
  });
