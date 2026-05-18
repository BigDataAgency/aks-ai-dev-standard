# GitHub/KitHub → InnoHub transitional report sync SOP

Purpose: keep today's staff behavior stable while making reports visible in InnoHub. Employees may continue submitting Test Reports through KitHub/GitHub/old channels. A private runner or authorized operator syncs those report files into InnoHub using public-repo-safe automation.

## Default transition flow

1. Staff keep creating report files in the current channel:
   - KitHub/GitHub checkout or PR branch
   - shared report folder copied into a local checkout
   - old chat/co-work channel where an operator can save the report as markdown/JSON
2. Automation scans the checkout for report files.
3. Dry-run validation is the default and performs no network send.
4. A private runner adds `--send` with private endpoint/token configuration stored outside this repo.
5. InnoHub owner/admin verifies accepted reports in the private BDA Standard Ingest dashboard.

Direct staff send with `commands/send-report.md` remains optional/pilot only. Do not force all employees to change their reporting habit before the transition is ready.

## Public repo safety rules

- Do not commit real InnoHub endpoint URLs, tokens, tenant secrets, or customer data.
- Keep state files outside the repo by default: `~/.bda-ai-dev/ingest-sync-state.json`.
- Use private runner configuration for endpoint/token values.
- Dry-run is safe for public examples because it validates locally and prints only a sync summary.
- Send mode requires explicit `--send` and connector authentication inputs.

## What the sync scans

Default patterns:

- `reports/**/*.md`
- `reports/**/*.json`
- `Testing/**/*.md`
- `Testing/**/*.json`
- `**/test-scenario-report*.md`
- `**/test-scenario-report*.json`

Override with `--patterns "reports/**/*.md,Testing/**/*.md"` when a team uses a different folder convention.

## Operator commands

Dry-run validation from a local checkout:

```bash
npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout
```

Pull first, then dry-run:

```bash
npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout --pull
```

Private runner send example with placeholder endpoint and token path:

```bash
npm run sync:github-reports -- \
  --repo-dir /path/to/kithub-or-github-checkout \
  --pull \
  --send \
  --endpoint https://example.com/ingest \
  --token-file /private/runner/ingest-token \
  --state-file /private/runner/bda-report-sync-state.json
```

Private environment alternative:

```bash
INNOHUB_INGEST_URL=https://example.com/ingest \
INNOHUB_INGEST_TOKEN_FILE=/private/runner/ingest-token \
npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout --pull --send
```

## Deduplication and force resend

The sync records successful sends by report path plus a file fingerprint. The default state file is outside the repo:

```text
~/.bda-ai-dev/ingest-sync-state.json
```

Use `--state-file` for private runners. A previously sent unchanged file is skipped. Use `--force` only when an authorized operator intentionally wants to resend the same file.

## No-CLI fallback for Nundeb / Co-work / chat

Staff do not need to run the CLI.

- Staff can send the report in the existing Nundeb, Co-work, KitHub, GitHub, or chat channel.
- An operator/Hermes saves the report as a markdown or JSON file under a scanned folder, for example `reports/`.
- The operator runs dry-run validation first.
- If valid, the private runner syncs it to InnoHub.
- If invalid, the operator asks for the missing report fields in chat; staff do not need to learn endpoint/token setup.

## Expected output

The sync prints a summary only:

- `scanned`: total local files inspected
- `candidates`: matching report files
- `validated`: files accepted by the existing connector
- `sent`: files sent when `--send` is used
- `skipped`: unchanged files already sent
- `errors`: file-level validation/send errors without payload/token contents
- `event_ids`: accepted event IDs returned by the private ingest endpoint

The sync must not print raw report payloads, bearer tokens, or production configuration.

## Recommended private cron shape

Do not commit this cron. Configure it only on a private runner:

```cron
15 8 * * * cd /path/to/bda-ai-dev-standard && INNOHUB_INGEST_URL=https://example.com/ingest INNOHUB_INGEST_TOKEN_FILE=/private/runner/ingest-token npm run sync:github-reports -- --repo-dir /path/to/kithub-or-github-checkout --pull --send --state-file /private/runner/bda-report-sync-state.json >> /private/runner/logs/bda-report-sync.log 2>&1
```

Replace placeholders with private runner paths/config outside this public repo.

## Troubleshooting

- `--send requires --endpoint`: add `--endpoint` or private `INNOHUB_INGEST_URL`.
- `--send requires --token-file`: add `--token-file`, `--token-env`, or a private ingest token env.
- `git pull --ff-only failed`: resolve checkout branch/divergence manually, then rerun.
- Report validation error: run `npm run ingest:report -- --file <report>` locally to see connector validation guidance.
- Duplicate skipped unexpectedly: edit the report file, use a separate private state file, or use `--force` for an intentional resend.
