import { Client } from "@upstash/qstash";
import { logger } from "../config/logger";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
});

export interface EmailJobPayload {
  to: string;
  subject: string;
  html: string;
  [key: string]: unknown;
}

export async function publishEmailJob(payload: EmailJobPayload) {
  try {
    const res = await qstash.publishJSON({
      url: process.env.EMAIL_API_URL!,
      body: payload
    });

    logger.info(
      {
        messageId: res.messageId
      },
      "QStash email job published"
    );

    return res;
  } catch (err: unknown) {
    const message =
      typeof err === "string"
        ? err
        : err instanceof Error
          ? err.message
          : String(err);
    logger.error(
      {
        message
      },
      "QStash email publish failed"
    );
    throw err;
  }
}
