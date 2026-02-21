export type ThreadCategory =
  | "PERSONAL"
  | "WORK"
  | "NEWSLETTER"
  | "ANNOUNCEMENT"
  | "PROMOTION"
  | "NOTIFICATION"
  | "SYSTEM"
  | "SPAM_RISK";

export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageDeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export interface MailSummary {
  summary: string;
  actionItems: string[];
  entities: string[];
}

export interface MailClassification {
  category: ThreadCategory;
  confidence: number;
  priorityScore: number;
  reasoning: string;
}

export interface MailMessage {
  id: string;
  threadId: string;
  messageIdHeader: string;
  fromAddress: string;
  toAddresses: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  direction: MessageDirection;
  deliveryStatus: MessageDeliveryStatus;
  isRead: boolean;
  sentAt: string;
  receivedAt: string;
  summary: MailSummary;
  classification: MailClassification;
}

export interface MailThread {
  id: string;
  contactName: string;
  contactEmail: string;
  contactAvatar?: string;
  subject: string;
  category: ThreadCategory;
  priorityScore: number;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  lastMessageAt: string;
  lastSummaryPreview: string;
}

export interface SendMessagePayload {
  threadId: string;
  body: string;
  optimizeTone?: "neutral" | "friendly" | "direct" | "executive";
}

export interface ProcessedIncomingMessage {
  summary: MailSummary;
  classification: MailClassification;
  cleanedBody: string;
}

export interface CommandMenuAction {
  id: string;
  label: string;
  shortcut?: string;
  run: () => void;
}
