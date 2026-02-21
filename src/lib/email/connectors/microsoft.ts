import { Client } from "@microsoft/microsoft-graph-client";

import type { EmailConnector, SendPayload, SyncResult } from "@/lib/email/connectors/base";

interface MicrosoftConnectorConfig {
  accessToken: string;
}

export class MicrosoftConnector implements EmailConnector {
  provider = "MICROSOFT" as const;

  private readonly client: Client;

  constructor(config: MicrosoftConnectorConfig) {
    this.client = Client.init({
      authProvider: ((done: (error: unknown, accessToken?: string) => void) => {
        done(null, config.accessToken);
      }) as never,
    });
  }

  async connect() {
    return;
  }

  async sync(options?: { cursor?: string; maxResults?: number }): Promise<SyncResult> {
    const top = options?.maxResults ?? 25;

    const response = await this.client
      .api("/me/messages")
      .top(top)
      .select(["id", "subject", "from", "toRecipients", "bodyPreview", "sentDateTime", "conversationId"])
      .get();

    const messages = (response.value ?? []).map((message: {
      id: string;
      subject?: string;
      from?: { emailAddress?: { address?: string } };
      toRecipients?: Array<{ emailAddress?: { address?: string } }>;
      bodyPreview?: string;
      sentDateTime?: string;
      conversationId?: string;
    }) => ({
      id: message.id,
      from: message.from?.emailAddress?.address ?? "",
      to: (message.toRecipients ?? []).map((recipient) => recipient.emailAddress?.address ?? "").filter(Boolean),
      subject: message.subject ?? "",
      text: message.bodyPreview ?? "",
      sentAt: message.sentDateTime ?? new Date().toISOString(),
      inReplyTo: message.conversationId,
      references: message.conversationId ? [message.conversationId] : undefined,
    }));

    return {
      messages,
      nextCursor: undefined,
    };
  }

  async send(payload: SendPayload) {
    const result = await this.client.api("/me/sendMail").post({
      message: {
        subject: payload.subject,
        body: {
          contentType: payload.html ? "HTML" : "Text",
          content: payload.html ?? payload.text,
        },
        toRecipients: payload.to.map((address) => ({ emailAddress: { address } })),
      },
      saveToSentItems: true,
    });

    return {
      messageId: result?.id ?? "sent",
    };
  }

  async disconnect() {
    return;
  }
}
