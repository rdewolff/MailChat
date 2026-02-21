import { nanoid } from "nanoid";

import type { MailClassification, MailMessage, MailSummary, MailThread, SendMessagePayload, ThreadCategory } from "@/lib/domain";

interface MockState {
  threads: MailThread[];
  messagesByThread: Record<string, MailMessage[]>;
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function buildSummary(summary: string, actionItems: string[] = [], entities: string[] = []): MailSummary {
  return { summary, actionItems, entities };
}

function buildClassification(category: ThreadCategory, priorityScore: number, confidence = 0.8, reasoning = "Heuristic"):
  MailClassification {
  return { category, priorityScore, confidence, reasoning };
}

const seededState: MockState = {
  threads: [
    {
      id: "thread-lucy",
      contactName: "Lucy Bennett",
      contactEmail: "lucy@northstar.studio",
      subject: "Q1 launch narrative",
      category: "WORK",
      priorityScore: 0.91,
      unreadCount: 2,
      isMuted: false,
      isArchived: false,
      lastMessageAt: minutesAgo(3),
      lastSummaryPreview: "Lucy locked narrative v4 and needs final sign-off before Monday 10:00.",
    },
    {
      id: "thread-newsletter",
      contactName: "Notion Weekly",
      contactEmail: "newsletter@notion.so",
      subject: "Product updates you missed",
      category: "NEWSLETTER",
      priorityScore: 0.21,
      unreadCount: 1,
      isMuted: false,
      isArchived: false,
      lastMessageAt: minutesAgo(49),
      lastSummaryPreview: "Weekly product digest with templates, AI docs, and community highlights.",
    },
    {
      id: "thread-ops",
      contactName: "CloudOps Alerts",
      contactEmail: "alerts@cloudops.io",
      subject: "Latency spike on mail ingestion",
      category: "NOTIFICATION",
      priorityScore: 0.74,
      unreadCount: 0,
      isMuted: true,
      isArchived: false,
      lastMessageAt: minutesAgo(90),
      lastSummaryPreview: "Service recovered after 7 minutes. Root cause points to Redis failover.",
    },
  ],
  messagesByThread: {
    "thread-lucy": [
      {
        id: "msg-lucy-1",
        threadId: "thread-lucy",
        messageIdHeader: "<msg-lucy-1@mailchat.dev>",
        fromAddress: "lucy@northstar.studio",
        toAddresses: ["you@mailchat.dev"],
        subject: "Q1 launch narrative",
        bodyText:
          "Hey team, v4 now reflects legal edits and the investor CTA. I need your approval before Monday 10:00 so design can freeze visuals.",
        direction: "INBOUND",
        deliveryStatus: "DELIVERED",
        isRead: false,
        sentAt: minutesAgo(5),
        receivedAt: minutesAgo(5),
        summary: buildSummary("Narrative v4 is final and waiting on your approval before Monday 10:00.", ["Approve or request edits before Monday 10:00"], ["Q1 launch", "investor CTA"]),
        classification: buildClassification("WORK", 0.91, 0.92, "Project/collaboration language with deadline."),
      },
      {
        id: "msg-lucy-2",
        threadId: "thread-lucy",
        messageIdHeader: "<msg-lucy-2@mailchat.dev>",
        fromAddress: "you@mailchat.dev",
        toAddresses: ["lucy@northstar.studio"],
        subject: "Q1 launch narrative",
        bodyText: "Looks good overall. Send me the final bullet list and I can approve in 30 minutes.",
        direction: "OUTBOUND",
        deliveryStatus: "DELIVERED",
        isRead: true,
        sentAt: minutesAgo(3),
        receivedAt: minutesAgo(3),
        summary: buildSummary("You requested the final bullet list before approval."),
        classification: buildClassification("WORK", 0.88, 0.9, "Reply in active project thread."),
      },
    ],
    "thread-newsletter": [
      {
        id: "msg-newsletter-1",
        threadId: "thread-newsletter",
        messageIdHeader: "<msg-newsletter-1@mailchat.dev>",
        fromAddress: "newsletter@notion.so",
        toAddresses: ["you@mailchat.dev"],
        subject: "Product updates you missed",
        bodyText: "This week: AI writing updates, database automations, and top community templates.",
        direction: "INBOUND",
        deliveryStatus: "DELIVERED",
        isRead: false,
        sentAt: minutesAgo(49),
        receivedAt: minutesAgo(49),
        summary: buildSummary("Weekly digest with product updates and templates."),
        classification: buildClassification("NEWSLETTER", 0.21, 0.95, "Bulk newsletter signatures and marketing cadence."),
      },
    ],
    "thread-ops": [
      {
        id: "msg-ops-1",
        threadId: "thread-ops",
        messageIdHeader: "<msg-ops-1@mailchat.dev>",
        fromAddress: "alerts@cloudops.io",
        toAddresses: ["you@mailchat.dev"],
        subject: "Latency spike on mail ingestion",
        bodyText:
          "Incident 4338 resolved. Ingestion p95 reached 2.4s between 14:03 and 14:10 UTC. Likely cause: Redis failover churn.",
        direction: "INBOUND",
        deliveryStatus: "DELIVERED",
        isRead: true,
        sentAt: minutesAgo(90),
        receivedAt: minutesAgo(90),
        summary: buildSummary("Incident recovered; temporary ingestion latency spike due to Redis failover."),
        classification: buildClassification("NOTIFICATION", 0.74, 0.89, "Automated alert format and incident metadata."),
      },
    ],
  },
};

const globalState = globalThis as unknown as {
  __mailchatMock?: MockState;
};

const state = globalState.__mailchatMock ?? structuredClone(seededState);

globalState.__mailchatMock = state;

export function getThreads() {
  return [...state.threads].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getMessages(threadId: string) {
  return [...(state.messagesByThread[threadId] ?? [])].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

export function upsertThreadPreview(threadId: string, lastSummaryPreview: string, category: ThreadCategory, priorityScore: number) {
  const index = state.threads.findIndex((thread) => thread.id === threadId);
  if (index === -1) {
    return;
  }

  const unreadCount = state.threads[index]?.unreadCount ?? 0;
  state.threads[index] = {
    ...state.threads[index],
    category,
    priorityScore,
    unreadCount,
    lastSummaryPreview,
    lastMessageAt: new Date().toISOString(),
  };
}

export function sendMessage(input: SendMessagePayload, fromAddress = "you@mailchat.dev", toAddress = "contact@mailchat.dev") {
  const thread = state.threads.find((entry) => entry.id === input.threadId);

  if (!thread) {
    throw new Error("Thread not found");
  }

  const nextMessage: MailMessage = {
    id: nanoid(),
    threadId: input.threadId,
    messageIdHeader: `<${nanoid()}@mailchat.dev>`,
    fromAddress,
    toAddresses: [thread.contactEmail || toAddress],
    subject: thread.subject,
    bodyText: input.body,
    direction: "OUTBOUND",
    deliveryStatus: "SENT",
    isRead: true,
    sentAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    summary: buildSummary(input.body),
    classification: buildClassification("PERSONAL", 0.5, 0.5, "Waiting for AI processing."),
  };

  state.messagesByThread[input.threadId] = [...(state.messagesByThread[input.threadId] ?? []), nextMessage];

  thread.lastMessageAt = nextMessage.sentAt;
  thread.lastSummaryPreview = input.body;

  return nextMessage;
}

export function ingestProcessedMessage(threadId: string, message: MailMessage) {
  state.messagesByThread[threadId] = [...(state.messagesByThread[threadId] ?? []), message];

  const thread = state.threads.find((entry) => entry.id === threadId);
  if (!thread) {
    return;
  }

  thread.category = message.classification.category;
  thread.priorityScore = message.classification.priorityScore;
  thread.lastSummaryPreview = message.summary.summary;
  thread.lastMessageAt = message.sentAt;
  thread.unreadCount += message.direction === "INBOUND" ? 1 : 0;
}

export function markThreadRead(threadId: string) {
  const thread = state.threads.find((entry) => entry.id === threadId);
  if (!thread) {
    return;
  }

  thread.unreadCount = 0;

  const messages = state.messagesByThread[threadId];
  if (!messages) {
    return;
  }

  state.messagesByThread[threadId] = messages.map((message) => ({ ...message, isRead: true }));
}
