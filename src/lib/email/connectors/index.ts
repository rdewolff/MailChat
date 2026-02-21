import type { EmailConnector } from "@/lib/email/connectors/base";
import { GmailConnector } from "@/lib/email/connectors/gmail";
import { ImapSmtpConnector } from "@/lib/email/connectors/imap-smtp";
import { MicrosoftConnector } from "@/lib/email/connectors/microsoft";

export function createConnector(provider: "GOOGLE" | "MICROSOFT" | "IMAP_SMTP", secretJson: string): EmailConnector {
  const config = JSON.parse(secretJson) as Record<string, unknown>;

  if (provider === "GOOGLE") {
    return new GmailConnector({
      clientId: String(config.clientId ?? ""),
      clientSecret: String(config.clientSecret ?? ""),
      redirectUri: String(config.redirectUri ?? ""),
      accessToken: String(config.accessToken ?? ""),
      refreshToken: String(config.refreshToken ?? ""),
    });
  }

  if (provider === "MICROSOFT") {
    return new MicrosoftConnector({
      accessToken: String(config.accessToken ?? ""),
    });
  }

  return new ImapSmtpConnector({
    imapHost: String(config.imapHost ?? ""),
    imapPort: Number(config.imapPort ?? 993),
    smtpHost: String(config.smtpHost ?? ""),
    smtpPort: Number(config.smtpPort ?? 465),
    secure: Boolean(config.secure ?? true),
    user: String(config.user ?? ""),
    pass: String(config.pass ?? ""),
  });
}
