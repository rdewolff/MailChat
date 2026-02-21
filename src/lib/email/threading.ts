import { nanoid } from "nanoid";

import type { EmailEnvelope } from "@/lib/email/connectors/base";

function canonicalSubject(subject: string) {
  return subject
    .replace(/^(re|fwd):\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function threadKeyFromEnvelope(envelope: EmailEnvelope) {
  const referenceSeed = envelope.references?.[0] || envelope.inReplyTo;
  if (referenceSeed) {
    return `ref:${referenceSeed}`;
  }

  const participants = [envelope.from, ...envelope.to]
    .map((address) => address.trim().toLowerCase())
    .sort()
    .join("|");

  return `sub:${canonicalSubject(envelope.subject)}::participants:${participants}`;
}

export function messageHeaderId(candidate?: string) {
  if (candidate?.trim()) {
    return candidate;
  }

  return `<${nanoid()}@mailchat.local>`;
}
