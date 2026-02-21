import { gmail_v1, google } from "googleapis";

import type { EmailConnector, SendPayload, SyncResult } from "@/lib/email/connectors/base";

interface GmailConnectorConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken?: string;
}

export class GmailConnector implements EmailConnector {
  provider = "GOOGLE" as const;

  private readonly oauth;

  private api?: gmail_v1.Gmail;

  constructor(private readonly config: GmailConnectorConfig) {
    this.oauth = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
    this.oauth.setCredentials({ access_token: config.accessToken, refresh_token: config.refreshToken });
  }

  async connect() {
    this.api = google.gmail({ version: "v1", auth: this.oauth });
  }

  async sync(options?: { cursor?: string; maxResults?: number }): Promise<SyncResult> {
    if (!this.api) {
      await this.connect();
    }

    const maxResults = options?.maxResults ?? 25;
    const listResponse = await this.api!.users.messages.list({
      userId: "me",
      maxResults,
      pageToken: options?.cursor,
    });

    const items = listResponse.data.messages ?? [];

    const messages = await Promise.all(
      items.map(async (item) => {
        const raw = await this.api!.users.messages.get({ userId: "me", id: item.id!, format: "metadata" });
        const headers = raw.data.payload?.headers ?? [];
        const findHeader = (name: string) => headers.find((entry) => entry.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

        return {
          id: item.id!,
          from: findHeader("From"),
          to: findHeader("To").split(",").map((v) => v.trim()).filter(Boolean),
          subject: findHeader("Subject"),
          text: "Fetched body requires additional decode path.",
          sentAt: findHeader("Date") || new Date().toISOString(),
          inReplyTo: findHeader("In-Reply-To") || undefined,
          references: findHeader("References") ? findHeader("References").split(" ") : undefined,
        };
      }),
    );

    return {
      messages,
      nextCursor: listResponse.data.nextPageToken ?? undefined,
    };
  }

  async send(payload: SendPayload) {
    if (!this.api) {
      await this.connect();
    }

    const raw = Buffer.from(
      [
        `From: ${payload.from}`,
        `To: ${payload.to.join(", ")}`,
        `Subject: ${payload.subject}`,
        payload.inReplyTo ? `In-Reply-To: ${payload.inReplyTo}` : "",
        payload.references?.length ? `References: ${payload.references.join(" ")}` : "",
        "Content-Type: text/plain; charset=utf-8",
        "",
        payload.text,
      ]
        .filter(Boolean)
        .join("\r\n"),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await this.api!.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return {
      messageId: response.data.id ?? "",
    };
  }

  async disconnect() {
    await this.oauth.revokeCredentials();
  }
}
