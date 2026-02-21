# Production Checklist

## Infra

- [ ] PostgreSQL with PITR backups
- [ ] Redis HA (or managed)
- [ ] Worker deployment separated from web
- [ ] Object storage for attachments

## Security

- [ ] Rotate `NEXTAUTH_SECRET`
- [ ] Encrypt provider secrets/tokens
- [ ] Enable HTTPS and HSTS
- [ ] Add abuse/rate limiting
- [ ] Add session hardening and CSRF checks

## Reliability

- [ ] Sentry for frontend and backend
- [ ] Metrics for API latency, queue lag, sync throughput
- [ ] Alerting on ingest failures and retry storms
- [ ] Runbook for provider outage and token expiry incidents

## Quality

- [ ] E2E tests for connect, sync, send, summarize, classify
- [ ] Contract tests for provider adapters
- [ ] Load test thread list + message timelines
- [ ] Accessibility pass for keyboard and screen reader flows

## Release

- [ ] Blue/green or canary deployment
- [ ] Feature flags for AI routing and voice controls
- [ ] Rollback plan validated
