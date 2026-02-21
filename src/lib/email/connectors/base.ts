export interface EmailEnvelope {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  sentAt: string;
  inReplyTo?: string;
  references?: string[];
}

export interface SyncResult {
  messages: EmailEnvelope[];
  nextCursor?: string;
}

export interface SendPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface EmailConnector {
  provider: "GOOGLE" | "MICROSOFT" | "IMAP_SMTP";
  connect(): Promise<void>;
  sync(options?: { cursor?: string; maxResults?: number }): Promise<SyncResult>;
  send(payload: SendPayload): Promise<{ messageId: string }>;
  disconnect(): Promise<void>;
}
