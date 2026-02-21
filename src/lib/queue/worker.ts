import { Worker } from "bullmq";

import { processIncomingMessage } from "@/lib/ai/pipeline";
import { env } from "@/lib/env";

function queueConnection() {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required to run queue workers.");
  }

  const url = new URL(env.REDIS_URL);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
  };
}

async function main() {
  const worker = new Worker(
    "mailchat-ingest",
    async (job) => {
      if (job.name !== "process-inbound") {
        return;
      }

      const payload = job.data as {
        threadId: string;
        messageId: string;
        rawBody: string;
      };

      const processed = await processIncomingMessage(payload.rawBody);

      return {
        threadId: payload.threadId,
        messageId: payload.messageId,
        processed,
      };
    },
    {
      connection: queueConnection(),
      concurrency: 8,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Processed ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Failed ${job?.id}`, error);
  });

  console.log("MailChat ingest worker started.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
