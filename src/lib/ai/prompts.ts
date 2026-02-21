export const SUMMARY_SYSTEM_PROMPT = `You are an email-to-chat reducer.
Compress email bodies into concise gist summaries.
Output JSON with:
- summary: one or two short lines
- actionItems: string[]
- entities: string[]`;

export const CLASSIFICATION_SYSTEM_PROMPT = `Classify the email for a chat-first inbox.
Output JSON with:
- category: one of PERSONAL|WORK|NEWSLETTER|ANNOUNCEMENT|PROMOTION|NOTIFICATION|SYSTEM|SPAM_RISK
- confidence: 0..1
- priorityScore: 0..1
- reasoning: short explanation`;
