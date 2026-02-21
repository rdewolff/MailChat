# MailChat Build Plan

## Objective

Ship a production-ready chat-first email app where each person becomes a thread, each email becomes a message bubble, and AI reduces inbox noise into actionable gist.

## Milestones

1. Foundation and platform
- Next.js app shell, design tokens, query layer, keyboard engine
- CI, linting, environment validation, health endpoint

2. Data and auth
- Prisma schema for users/workspaces/connections/threads/messages
- Auth.js with Google + Microsoft OAuth
- Encryption strategy for provider secrets

3. Connectivity and sync
- Connector interfaces and provider implementations
- Gmail API + Microsoft Graph + IMAP/SMTP flow
- Background sync with BullMQ and Redis cursors

4. AI processing
- Email cleanup (quote/signature removal)
- Summary generation
- Category detection and priority scoring
- Action item extraction

5. Core UX
- Thread list + timeline + detail panel
- Summary/original toggles
- Rich composer with tone presets
- Voice transcription

6. Performance and reliability
- Caching and optimistic updates
- Retry/backoff and dead-letter handling
- Monitoring and alerting

7. Production readiness
- Load/perf tests
- Security audit and threat model
- Deployment with rollback policy

## Execution Rules

- Keep interactions keyboard-first.
- Preserve raw email visibility while defaulting to AI gist.
- Classify low-priority traffic into separate categories without hiding it.
- Keep send/read latency low and predictable.

## Success Metrics

- Thread switch p95 < 120ms after load
- Message ingest to UI visibility < 2s
- AI summary p95 < 4s
- User can triage inbox using keyboard only
