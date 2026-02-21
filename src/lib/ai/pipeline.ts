import OpenAI from "openai";

import { env } from "@/lib/env";
import type { MailClassification, MailSummary, ProcessedIncomingMessage, ThreadCategory } from "@/lib/domain";
import { clamp } from "@/lib/utils";

const categoryKeywords: Array<{ category: ThreadCategory; terms: string[]; priority: number }> = [
  { category: "NEWSLETTER", terms: ["unsubscribe", "weekly", "digest", "newsletter"], priority: 0.2 },
  { category: "PROMOTION", terms: ["deal", "discount", "offer", "sale"], priority: 0.18 },
  { category: "ANNOUNCEMENT", terms: ["announcement", "release", "launch", "press"], priority: 0.45 },
  { category: "NOTIFICATION", terms: ["alert", "incident", "failed", "status"], priority: 0.75 },
  { category: "SYSTEM", terms: ["otp", "verification", "security", "password"], priority: 0.8 },
  { category: "WORK", terms: ["deadline", "meeting", "proposal", "approval"], priority: 0.85 },
  { category: "PERSONAL", terms: ["family", "dinner", "weekend", "trip"], priority: 0.6 },
];

function simpleSummary(body: string): MailSummary {
  const cleanBody = body.replace(/\s+/g, " ").trim();
  const clipped = cleanBody.slice(0, 220);

  const actionItems = cleanBody
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /\b(need|please|deadline|approve|review|action|required|todo)\b/i.test(sentence))
    .slice(0, 3);

  const entityMatches = cleanBody.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) ?? [];

  return {
    summary: clipped,
    actionItems,
    entities: [...new Set(entityMatches)].slice(0, 5),
  };
}

function simpleClassification(body: string): MailClassification {
  const lower = body.toLowerCase();

  for (const entry of categoryKeywords) {
    if (entry.terms.some((term) => lower.includes(term))) {
      return {
        category: entry.category,
        confidence: 0.8,
        priorityScore: entry.priority,
        reasoning: `Keyword match (${entry.terms.join(", ")}).`,
      };
    }
  }

  return {
    category: "PERSONAL",
    confidence: 0.5,
    priorityScore: 0.45,
    reasoning: "No deterministic category match found.",
  };
}

async function modelSummaryAndClassification(body: string) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content:
          "You transform emails into compact chat entries. Return compact JSON only with keys summary, actionItems, entities, category, confidence, priorityScore, reasoning.",
      },
      {
        role: "user",
        content: body,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "mailchat_processing",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            actionItems: { type: "array", items: { type: "string" } },
            entities: { type: "array", items: { type: "string" } },
            category: {
              type: "string",
              enum: [
                "PERSONAL",
                "WORK",
                "NEWSLETTER",
                "ANNOUNCEMENT",
                "PROMOTION",
                "NOTIFICATION",
                "SYSTEM",
                "SPAM_RISK",
              ],
            },
            confidence: { type: "number" },
            priorityScore: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["summary", "actionItems", "entities", "category", "confidence", "priorityScore", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const text = response.output_text?.trim();
  if (!text) {
    return null;
  }

  const parsed = JSON.parse(text) as {
    summary: string;
    actionItems: string[];
    entities: string[];
    category: ThreadCategory;
    confidence: number;
    priorityScore: number;
    reasoning: string;
  };

  return {
    summary: {
      summary: parsed.summary,
      actionItems: parsed.actionItems,
      entities: parsed.entities,
    },
    classification: {
      category: parsed.category,
      confidence: clamp(parsed.confidence),
      priorityScore: clamp(parsed.priorityScore),
      reasoning: parsed.reasoning,
    },
  };
}

export function cleanEmailBody(body: string) {
  return body
    .replace(/On .* wrote:\n[\s\S]*/gi, "")
    .replace(/\n>.*$/gm, "")
    .replace(/\n\s*--\s*\n[\s\S]*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function processIncomingMessage(rawBody: string): Promise<ProcessedIncomingMessage> {
  const cleanedBody = cleanEmailBody(rawBody);
  const aiResult = await modelSummaryAndClassification(cleanedBody).catch(() => null);

  if (aiResult) {
    return {
      cleanedBody,
      summary: aiResult.summary,
      classification: aiResult.classification,
    };
  }

  return {
    cleanedBody,
    summary: simpleSummary(cleanedBody),
    classification: simpleClassification(cleanedBody),
  };
}

export function optimizeDraftTone(input: string, tone: "neutral" | "friendly" | "direct" | "executive" = "neutral") {
  const normalized = input.trim();
  if (!normalized) {
    return normalized;
  }

  if (tone === "direct") {
    return normalized.replace(/\bi think\b/gi, "").replace(/\s+/g, " ").trim();
  }

  if (tone === "friendly") {
    return `Hey, ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
  }

  if (tone === "executive") {
    return `Summary: ${normalized}`;
  }

  return normalized;
}
