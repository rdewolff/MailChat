import { Queue } from "bullmq";

import { env } from "@/lib/env";

export const QUEUES = {
  INGEST: "mailchat-ingest",
  SYNC: "mailchat-sync",
} as const;

let ingestQueue: Queue | null = null;

function queueConnection() {
  if (!env.REDIS_URL) {
    return null;
  }

  const url = new URL(env.REDIS_URL);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
  };
}

export function getIngestQueue() {
  const connection = queueConnection();
  if (!connection) {
    return null;
  }

  ingestQueue ??= new Queue(QUEUES.INGEST, {
    connection,
    defaultJobOptions: {
      attempts: 4,
      backoff: {
        type: "exponential",
        delay: 500,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

  return ingestQueue;
}

export async function enqueueInboundProcessing(payload: {
  threadId: string;
  messageId: string;
  rawBody: string;
}) {
  const queue = getIngestQueue();
  if (!queue) {
    return false;
  }

  await queue.add("process-inbound", payload, {
    jobId: payload.messageId,
  });

  return true;
}
