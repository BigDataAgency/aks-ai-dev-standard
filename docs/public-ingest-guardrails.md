# Public InnoHub Ingest Guardrails

This document defines the minimum guardrails for any future InnoHub ingest pipeline that consumes AKS AI Dev Standard (เดิม BDA AI Dev Standard) outputs.

## Public repo rule

This public repository remains standards/templates/prompts/schemas only. It must never be a direct unauthenticated ingress path into InnoHub production.

## Required controls for a private connector

A future private connector must enforce all controls below before accepting data from any automation, agent, CI job, or user workstation.

### 1. Authentication and tenant binding

- Require `Authorization: Bearer <token>` for every ingest request.
- Require an explicit tenant identifier such as `INNOHUB_TENANT_ID`.
- Bind tokens to an allowed tenant, environment, and scope.
- Reject missing, expired, revoked, or cross-tenant tokens.

### 2. Optional request signing

For higher-risk or production routes, add replay-resistant signing:

- `X-BDA-Timestamp`: Unix timestamp or ISO-8601 timestamp.
- `X-BDA-Signature`: HMAC over method, path, timestamp, tenant, and body hash.
- Reject stale timestamps and duplicate nonces/signatures.

### 3. Schema validation

- Validate every payload against a versioned schema.
- Reject unknown required fields, unsafe HTML/script content, oversized fields, and malformed attachments.
- Store schema version and validation result in audit logs.

### 4. Rate limiting and abuse controls

- Apply per-token, per-tenant, and per-IP rate limits.
- Add circuit breakers for repeated validation/auth failures.
- Log rejects without storing raw secrets or sensitive payloads.

### 5. PII and secret leakage prevention

- Minimize payloads to the fields needed for the workflow.
- Redact tokens, cookies, private keys, session IDs, customer identifiers, financial data, and screenshots with sensitive content.
- Never send production secrets from `.env`, shell history, browser storage, or local config.

### 6. Environment and endpoint allowlists

- Use private deployment configuration for allowed ingest endpoints.
- Do not commit production hostnames or credentials in this public repository.
- Prefer localhost or `example.com` placeholders in docs and templates.
- Maintain tenant/environment allowlists in the private connector.

### 7. Safe defaults

- Default to `BDA_STANDARD_MODE=local`.
- Default ingest URL/token/tenant values to empty strings.
- Require an explicit operator/deployment decision before enabling remote ingest.
- Run `scripts/security-public-repo-check.sh` before merging public-repo changes.

## Non-goals

This repository does not implement the production ingest connector, credential broker, secret store, or deployment-specific allowlists. Those belong in private infrastructure repositories.
