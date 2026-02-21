# MailChat

MailChat is a chat-first email client built with Next.js and Tailwind CSS. It turns inbox conversations into fast, threaded chat flows with AI summaries, AI classification, and keyboard-first workflows.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- TanStack Query
- Prisma + SQLite schema
- BullMQ + Redis workers
- NextAuth (Google + Microsoft)
- OpenAI (summary/classification)
- IMAP/SMTP + Gmail API + Microsoft Graph connectors

## Features in this repo

- Chat-style email UX (thread list, message timeline, detail sidebar)
- Summary/original toggles per thread
- AI pipeline for cleanup, summary, and categorization
- Voice composer with browser speech recognition + Whisperit server fallback
- Keyboard shortcuts + command palette
- API routes for threads, messages, ingest simulation, voice transcript, health
- Connector abstractions for Google, Microsoft, IMAP/SMTP
- Production-oriented Prisma schema for multi-provider email sync

## Keyboard Shortcuts

- `Cmd/Ctrl + K` command palette
- `J / K` next/previous thread
- `S` toggle summary/original
- `D` toggle detail panel
- `/` focus search
- `Cmd/Ctrl + Enter` send message
- `Shift + V` start/stop voice capture

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:push
npm run dev
```

Open `http://localhost:3000`.

## Environment

See `.env.example` for all variables.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run prisma:push
npm run worker:ingest
```

## Production Notes

- Replace mock repository in `src/lib/server/repositories.ts` with Prisma-backed persistence for all routes.
- Run workers as separate services for sync + AI processing.
- Configure OAuth credentials and minimal scopes for each provider.
- Store secrets encrypted at rest.
- Configure Sentry/metrics for queue and API performance.

## Docs

- `docs/BUILD_PLAN.md`: full execution plan and milestones
- `docs/ARCHITECTURE.md`: system architecture and data flow
- `docs/PRODUCTION_CHECKLIST.md`: go-live checklist
