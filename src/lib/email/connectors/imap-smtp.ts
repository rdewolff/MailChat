import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

import type { EmailConnector, SendPayload, SyncResult } from "@/lib/email/connectors/base";

interface ImapSmtpConnectorConfig {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  user: string;
  pass: string;
}

export class ImapSmtpConnector implements EmailConnector {
  provider = "IMAP_SMTP" as const;

  private readonly imap: ImapFlow;

  private readonly transport: nodemailer.Transporter;

  constructor(private readonly config: ImapSmtpConnectorConfig) {
    this.imap = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    this.transport = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async connect() {
    if (!this.imap.usable) {
      await this.imap.connect();
    }
  }

  async sync(options?: { cursor?: string; maxResults?: number }): Promise<SyncResult> {
    await this.connect();
    await this.imap.mailboxOpen("INBOX");

    const limit = options?.maxResults ?? 25;
    const mailbox = this.imap.mailbox;
    if (!mailbox) {
      return { messages: [] };
    }

    const start = Math.max(1, mailbox.exists - limit + 1);
    const range = `${start}:*`;

    const messages: SyncResult["messages"] = [];

    for await (const message of this.imap.fetch(range, { envelope: true, source: true })) {
      messages.push({
        id: String(message.uid),
        from: message.envelope?.from?.[0]?.address ?? "",
        to: (message.envelope?.to ?? []).map((recipient) => recipient.address ?? "").filter(Boolean),
        subject: message.envelope?.subject ?? "",
        text: message.source?.toString("utf8")?.slice(0, 6000) ?? "",
        sentAt: message.envelope?.date?.toISOString() ?? new Date().toISOString(),
        inReplyTo: message.envelope?.inReplyTo?.toString(),
        references: message.envelope?.messageId ? [message.envelope.messageId] : undefined,
      });
    }

    return {
      messages,
      nextCursor: String(mailbox.uidNext),
    };
  }

  async send(payload: SendPayload) {
    const info = await this.transport.sendMail({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      inReplyTo: payload.inReplyTo,
      references: payload.references,
    });

    return {
      messageId: info.messageId,
    };
  }

  async disconnect() {
    if (this.imap.usable) {
      await this.imap.logout();
    }

    this.transport.close();
  }
}
