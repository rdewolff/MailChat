# Architecture

## Components

- Web app: Next.js App Router frontend + API routes
- Persistence: SQLite via Prisma
- Queue: Redis + BullMQ for sync and AI processing
- Providers: Gmail API, Microsoft Graph, IMAP + SMTP
- AI layer: OpenAI-based summarization/classification with deterministic fallback
- Voice layer: Browser speech recognition and Whisperit server transcription fallback

## High-Level Flow

1. User connects mailbox provider.
2. Sync worker pulls new messages by cursor.
3. Message body is normalized and stripped of noise.
4. AI classifies and summarizes message.
5. Thread metadata is updated (preview, category, priority, unread).
6. UI receives updates and renders chat timeline.
7. Outbound compose runs tone optimization and sends via provider.

## Threading Strategy

- Primary: `In-Reply-To` and `References` headers
- Secondary fallback: canonical subject + participant set
- Deduplication: provider message id + header id

## Resilience Strategy

- Queue retries with exponential backoff
- Idempotent ingest jobs keyed by message id
- Persistent sync cursors per connection
- Dead-letter logging for failed classification/sync jobs

## Security

- OAuth token storage encrypted at rest
- Principle-of-least-privilege scopes
- Workspace-level tenant isolation
- Signed URLs for attachment downloads
- Audit logs for mutating actions
