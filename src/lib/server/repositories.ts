import { optimizeDraftTone, processIncomingMessage } from "@/lib/ai/pipeline";
import type { MailMessage, SendMessagePayload } from "@/lib/domain";
import {
  getMessages,
  getThreads,
  ingestProcessedMessage,
  markThreadRead,
  sendMessage,
  upsertThreadPreview,
} from "@/lib/server/mock-store";

export async function listThreads() {
  return getThreads();
}

export async function listThreadMessages(threadId: string) {
  markThreadRead(threadId);
  return getMessages(threadId);
}

export async function sendThreadMessage(input: SendMessagePayload) {
  const optimized = optimizeDraftTone(input.body, input.optimizeTone);
  const message = sendMessage({ ...input, body: optimized });

  const processed = await processIncomingMessage(optimized);
  upsertThreadPreview(input.threadId, processed.summary.summary, processed.classification.category, processed.classification.priorityScore);

  return {
    ...message,
    summary: processed.summary,
    classification: processed.classification,
  };
}

export async function ingestInboundMessage(input: {
  threadId: string;
  fromAddress: string;
  toAddresses: string[];
  subject: string;
  bodyText: string;
}): Promise<MailMessage> {
  const processed = await processIncomingMessage(input.bodyText);

  const message: MailMessage = {
    id: crypto.randomUUID(),
    threadId: input.threadId,
    messageIdHeader: `<${crypto.randomUUID()}@mailchat.dev>`,
    fromAddress: input.fromAddress,
    toAddresses: input.toAddresses,
    subject: input.subject,
    bodyText: processed.cleanedBody,
    direction: "INBOUND",
    deliveryStatus: "DELIVERED",
    isRead: false,
    sentAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    summary: processed.summary,
    classification: processed.classification,
  };

  ingestProcessedMessage(input.threadId, message);

  return message;
}
