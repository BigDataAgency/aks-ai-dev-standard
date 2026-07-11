# Staff SOP: Send BDA AI Dev Report to InnoHub

SOP for staff AI, QA/product staff, and implementation agents that need to prepare or send AKS AI Dev Standard (เดิม BDA AI Dev Standard) report summaries to an InnoHub ingest endpoint without exposing secrets.

## Purpose and scope

Use this SOP when you already have a AKS AI Dev Standard Test Report / test-scenario-report file and need to create a safe `bda-standard-ingest/0.4.1` `report_summary` payload for InnoHub.

This SOP covers:

- Dry-run conversion from report markdown/JSON to local JSON payload.
- Explicit remote send to a private InnoHub ingest endpoint when authorized.
- Secret, endpoint, PII, and payload safety checks for public-repo usage.
- Owner dashboard verification at `/admin/bda-standard-ingest`.

This SOP does not cover:

- Creating production ingest credentials.
- Sharing production endpoints in a public repo or chat.
- Sending raw screenshots or raw payloads that contain secrets, customer data, or unredacted PII.

## Prerequisites

1. Work from the standards repo root.
2. Confirm the report file exists and is a Test Report / test-scenario-report markdown or JSON file.
3. Confirm the report is redacted before ingest:
   - No raw token, cookie, API key, private key, password, session ID, or credential.
   - No unredacted customer/person PII.
   - No production endpoint in public examples or public commits.
4. For remote send only, get private configuration from the InnoHub owner/admin outside this public repo:
   - Ingest endpoint URL: keep private; use `https://example.com/ingest` only as public placeholder.
   - Token file path or environment variable: never paste the raw token into chat.
   - Tenant ID if required by private deployment.
5. Network send must be explicitly requested with `--send`; dry-run is the default.

## Dry-run command (default, safe first step)

Run dry-run before any remote send:

```bash
npm run ingest:report -- --file reports/test-report.md
```

Optional project override:

```bash
npm run ingest:report -- --file reports/test-report.md --project "Example Project"
```

Expected dry-run output shape:

```json
{
  "mode": "dry-run",
  "payload": {
    "type": "test_report",
    "standard_version": "test_report.v0.4.1",
    "source": "bda-ai-dev-standard/test-scenario-report",
    "created_at": "<ISO timestamp>",
    "payload": {
      "title": "<report title>",
      "summary": { "project": "<project>", "status": "PASS|FAIL|BLOCKED|LIMITED|INFO|NOT_RUN" },
      "status": "<status>",
      "report_path": "reports/test-report.md"
    }
  }
}
```

Stop if dry-run output contains secrets, raw customer data, or unsafe evidence paths. Redact the source report and run dry-run again.

## Send command with private token-file

Use this when a private token is stored in a local secret file. The token file must not be committed.

```bash
npm run ingest:report -- --file reports/test-report.md --send --endpoint https://example.com/ingest --token-file /private/path/innohub-ingest-token --tenant example-tenant
```

Public docs must keep `https://example.com/ingest` as a placeholder. Replace it only in a private shell/session, not in committed files or public chat.

## Send command with private environment variables

Use this when your workstation/CI has private env vars configured:

```bash
export INNOHUB_INGEST_URL="https://example.com/ingest"
export INNOHUB_INGEST_TOKEN_FILE="/private/path/innohub-ingest-token"
export INNOHUB_TENANT_ID="example-tenant"
npm run ingest:report -- --file reports/test-report.md --send
```

Alternative token env var for private CI only:

```bash
export INNOHUB_INGEST_URL="https://example.com/ingest"
export INNOHUB_INGEST_TOKEN="" # fill from private secret manager in your shell/session only
export INNOHUB_TENANT_ID="example-tenant"
# Example private shell pattern: INNOHUB_INGEST_TOKEN="$(secret-manager-read innohub-ingest-token)" npm run ingest:report -- --file reports/test-report.md --send
npm run ingest:report -- --file reports/test-report.md --send
```

Do not paste the raw token value into the report, issue tracker, Obsidian, public repo, or AI chat.

## Expected send output and `event_id`

Successful send returns JSON like:

```json
{
  "mode": "sent",
  "endpoint": "https://example.com/ingest",
  "result": {
    "status": 202,
    "event_id": "evt_...",
    "response_body_redacted": "{\"event_id\":\"evt_...\"}"
  }
}
```

Record only redacted evidence in handoff/operational reporting:

- Commit/report path: okay.
- `mode`: okay.
- HTTP status: okay.
- `event_id`: okay if it is not treated as a secret by the private deployment.
- Raw token, Authorization header, production endpoint, raw payload with PII: not okay.

## InnoHub owner dashboard verification

After a remote send, the InnoHub owner/admin verifies accepted reports in the private dashboard:

1. Open InnoHub admin dashboard.
2. Go to `/admin/bda-standard-ingest`.
3. Search/filter by `event_id`, tenant, report title, project, date/time, or source.
4. Confirm accepted/validated status, schema version, source, and redacted summary.
5. If rejected, use the dashboard error message plus the troubleshooting matrix below. Do not copy raw secret-bearing payloads into public chat.

## Troubleshooting matrix

- Symptom: `ERROR: --file is required`
  - Likely cause: Missing report path.
  - Action: Re-run with `--file reports/test-report.md`.

- Symptom: `Input file not found`
  - Likely cause: Wrong path or running outside repo root.
  - Action: Check the path and current directory; do not paste private file contents into chat.

- Symptom: `Report cannot be converted ... missing/invalid`
  - Likely cause: Report lacks project, title, status, summary, or evidence manifest fields.
  - Action: Fix the report using `core/templates/test-scenario-report.md`, then dry-run again.

- Symptom: `high-confidence secret pattern`
  - Likely cause: Report contains token, key, password, Authorization header, or similar secret.
  - Action: Redact the source report. Rotate exposed credentials if they left a private machine.

- Symptom: `--endpoint or INNOHUB_INGEST_URL is required when --send is used`
  - Likely cause: Remote send requested without endpoint config.
  - Action: Ask InnoHub owner/admin for private endpoint. Keep public examples on `example.com`.

- Symptom: `token ... required when --send is used`
  - Likely cause: No token file/env configured.
  - Action: Use `--token-file /private/path/...`, `INNOHUB_INGEST_TOKEN_FILE`, or private `INNOHUB_INGEST_TOKEN`.

- Symptom: `Choose one token source only`
  - Likely cause: Both token file and token env were provided.
  - Action: Use exactly one token source.

- Symptom: `Refusing non-HTTPS remote endpoint`
  - Likely cause: HTTP endpoint outside localhost.
  - Action: Use HTTPS for remote. HTTP is allowed only for localhost/127.0.0.1 local testing.

- Symptom: `HTTP 401/403` or endpoint rejected request
  - Likely cause: Missing/expired/wrong token or tenant binding.
  - Action: InnoHub owner/admin checks token scope, tenant, environment, and revocation state.

- Symptom: No report appears in `/admin/bda-standard-ingest`
  - Likely cause: Wrong environment/tenant, reject before persistence, or dashboard filter mismatch.
  - Action: Verify `event_id`, tenant, source, timestamp, and private endpoint with owner/admin.

## Security checklist before send

- [ ] Dry-run reviewed first.
- [ ] No raw token in chat, issue tracker, Obsidian, logs, screenshots, or committed files.
- [ ] No production endpoint in public examples or public commits; use `example.com`/`localhost` placeholders.
- [ ] Token is loaded from private token-file/env/secret manager only.
- [ ] Report payload contains no raw secrets, cookies, Authorization headers, passwords, API keys, private keys, session IDs, or browser storage dumps.
- [ ] PII/customer/payment data is redacted or excluded.
- [ ] Screenshots/evidence paths are safe; sensitive images are masked before sharing.
- [ ] Tenant/environment is correct for the private endpoint.
- [ ] Remote send includes explicit `--send`; dry-run remains default.
- [ ] Public-repo changes were checked with `npm run security:public-repo` before commit.

## Staff AI handoff format

When done, report:

- `BDA Standard files used`: include this SOP and the report/template files used.
- `Pipeline trace`: Understand → Plan → Execute → Verify → Handoff.
- `Commands run`: include dry-run and optional send command with placeholders/redacted token source.
- `Verification / Evidence`: include dry-run mode, send mode/status/event_id if sent, and owner dashboard verification status.
- `Limitations / Risks / Next steps`: include any pending owner verification, rejected ingest, or redaction follow-up.
