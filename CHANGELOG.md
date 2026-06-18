# Changelog

All notable changes to BDA AI Dev Standard are tracked here.

This project uses Semantic Versioning: `MAJOR.MINOR.PATCH`.

- MAJOR: breaking changes to command names, required outputs, or installation layout
- MINOR: new commands, workflows, templates, adapters, or substantial behavior improvements
- PATCH: clarifications, typo fixes, safer wording, and non-breaking documentation updates

## [0.10.2] - 2026-06-16

### Changed

- Clarified that BDA Gateway capacity changes such as adding a second A40 node are handled centrally by the gateway; staff keep the same key, Base URL, and model names.
- Added Hermes/IDE guidance that `Free Fast Local`, `Auto Default Local`, and `Qwen3 Coder` can be load-balanced behind the gateway without employee reinstall.
- Updated version metadata to `0.10.2`.

## [0.10.1] - 2026-06-15

### Changed

- Added a compact local/Hermes prompt path so Qwen/local models do not receive the full standard and hit context limits during `bda start`.
- Clarified context routing: split long work, avoid large pasted files/logs, and move long coding tasks to larger-context models.
- Clarified vision routing: use Gemini, NotebookLM, or a vision-capable model to extract screenshot/image facts before continuing in Hermes/Qwen.
- Updated AI/Codex/Claude guidance so `bda stop` must close the existing active session instead of drafting new metadata.
- Updated version metadata to `0.10.1`.

### Fixed

- `scripts/bda.mjs` now keeps `bda event` and `bda stop` on the active session id, and `bda stop` sends a clear `command="bda stop"` close event.
- Added smoke assertions that events and stop events preserve the started session id.

## [0.10.0] - 2026-06-14

### Added

- Added `bda` session CLI with `bda start`, `bda event`, `bda stop`, `bda current`, and `bda help` so staff can log useful AI work as sessions instead of manual daily logs.
- Added `docs/bda-session-cli.md` with the command catalog and AI behavior for drafting/confirming metadata when staff type `bda start`.
- Added local outbox fallback under `.bda-skills/outbox/` when work-event delivery fails, so staff using non-BDA AI providers can still preserve work events for later sync.
- Added smoke coverage for the BDA session CLI.

### Changed

- Updated `bda-work-event` config loading to honor project-local config fields and `BDA_AI_WORK_EVENT_URL`, matching the private Hermes/BDA gateway installer environment.
- Preserved existing coding discipline: command sessions still require minimum correct change thinking, and verification maps to success criteria in final handoff.
- Updated version metadata to `0.10.0`.

## [0.9.0] - 2026-06-14

### Added

- Added automatic BDA work event logging guidance for dev, nondev, and PM lead workflows so useful AI-assisted work can replace manual daily log collection.
- Added `scripts/bda-work-event.mjs` for sending standard work events through a configurable endpoint without hardcoding production secrets in the public repo.
- Added PM / PM lead command set: `pm-log`, `pm-standup`, `pm-status`, `pm-risk`, `pm-followup`, and `pm-requirement`, including Claude Code slash adapters.
- Added setup guidance for Hermes, Windsurf, and IDE use with personal employee keys and required metadata for real BDA work.

### Changed

- Updated README, AI routing, Codex instructions, and Claude instructions to reference PM lead commands and work event logging.
- Documented Claude Code Developer Mode as a supported gateway client when the installed build or organization wrapper supports local gateway/base-url configuration.
- Updated current version metadata to `0.9.0`.

## [0.8.1] - 2026-06-05

### Changed

- Clarified that supported slash command names remain stable while workflow internals add proportional discipline checks.
- Added guidance for asking clarification only when ambiguity affects scope, data safety, security, or correctness.
- Reinforced coding discipline for lightweight tasks: compact success criteria, minimum correct change, and verification maps to success criteria instead of heavy reports.
- Updated current version metadata to `0.8.1`.

## [0.8.0] - 2026-05-24

### Changed

- Added BDA-neutral coding discipline guidance across core standard, AI adapters, work commands, and before-commit checklist.
- Reinforced success criteria, minimum correct change, existing-pattern alignment, changed-line traceability, and no unrelated refactor/format churn.
- Updated verification expectations so verification maps to success criteria and unverified areas are stated explicitly.
- Updated current version metadata to `0.8.0`.

## [0.7.0] - 2026-05-21

### Removed

- Removed staff operational reporting and planning commands from the public command surface to avoid employee confusion.
- Removed the related command files, Claude slash adapters, staff adapters, Gemini prompts, Claude coworker prompts, and templates.
- Removed these workflows from README, AI, Claude, Codex, and smoke validation routing.

### Changed

- Command pack now focuses on developer work, Obsidian context, QA/product evidence, report sending, performance review, and standard feedback.
- `test-report` remains the staff-facing QA/product evidence command.
- Smoke validation now fails if removed staff reporting/planning command files or terms return.
- Updated current version metadata to `0.7.0`.

## [0.6.0] - 2026-05-21

### Removed

- Removed legacy versioned staff reporting/planning command files and Claude adapters.
- Removed legacy staff reporting/planning template filenames.
- Removed legacy self-contained wording from report-sender command docs.

### Changed

- Staff reporting/planning names were temporarily made direct canonical commands before being removed in `0.7.0`.
- Updated README, AI, Claude, Codex, staff, Gemini, and Claude coworker docs to reference normal command names.
- Updated smoke validation to fail if removed legacy versioned terms or files return.
- Updated current version metadata to `0.6.0`.

## [0.5.0] - 2026-05-21

### Added

- `commands/init.md` for initializing Obsidian/project context before running normal work commands.
- `templates/obsidian-context.md` as the canonical context manifest template.
- `templates/obsidian-work-note.md` for session notes and testcase/evidence notes.
- Claude Code slash adapter `claude/commands/init.md`.

### Changed

- `plan-work`, `fix-bug`, `build-feature`, `write-document`, and `update-obsidian` now read Obsidian context when present and update session/evidence notes by default.
- `workflows/obsidian.md`, `AI-README.md`, `README.md`, `claude/CLAUDE.md`, and `codex/AGENTS.md` now document the init-to-context flow.
- Updated current version metadata to `0.5.0`.

## [0.4.1] - 2026-05-18

### Added

- Public-repo ingress protection hardening:
  - `.env.example` with local-only defaults and empty InnoHub ingest placeholders.
  - `SECURITY.md` documenting public repository boundaries, local-output default mode, and private production-ingest requirements.
  - `docs/public-ingest-guardrails.md` for future private InnoHub connector controls.
  - `scripts/security-public-repo-check.sh` to block production endpoint/secret patterns in public files.

### Changed

- Expanded `.gitignore` coverage for local env files, credentials, secrets, and private key material while keeping `.env.example` tracked.
- Added README security notice for public repository usage and no auto-ingest defaults.
- Updated current version metadata to `0.4.1`.

## [0.4.0] - 2026-05-18

### Added

- Staff command pack and adapter prompt packs for Gemini and Claude coworker.
- Codex/Claude/general AI docs for command aliases and adapter-specific usage.

### Changed

- Updated current version metadata to `0.4.0`.

## [0.3.0] - 2026-05-18

### Changed

- Improved `test-scenario-report` based on an InnoHub production trial:
  - Added production read-only guardrails and no-mutation pass criteria.
  - Added Auth/RBAC matrix and test account classification.
  - Added route source trace, technical-verification-only wording, route drift checks, and SPA 404 detection.
  - Added blocked reason taxonomy and evidence manifest with screenshot/console/network/PII masking fields.
  - Reinforced InnoHub/user-facing visible-menu navigation rule.

## [0.2.0] - 2026-05-17

### Added

- QA/product evidence workflow for test case/scenario execution with screenshot capture and Markdown report generation:
  - `commands/test-scenario-report.md`
  - `workflows/test-scenario-report.md`
  - `templates/test-scenario-report.md`
  - `claude/commands/test-scenario-report.md`
- Smoke validation coverage for the new test scenario report workflow and Claude slash command.

### Notes

- This workflow is explicitly separate from performance evaluation.
- User-facing checks, including InnoHub scenarios, should use visible-menu navigation by default; hidden/direct routes must be labeled technical verification only.

## [0.1.0] - 2026-05-17

Initial public release.

### Added

- Core BDA AI Dev Standard documentation: `README.md`, `AI-README.md`, `STANDARD.md`
- Neutral commands for common work types:
  - pending work
  - new work / feature work
  - bug fix
  - code review
  - small / medium / large tasks
  - writing and documents
  - Obsidian updates
  - performance review
- Codex adapter: `codex/AGENTS.md`
- Claude adapter and slash-command files: `claude/CLAUDE.md`, `claude/commands/*.md`
- Required reporting trace for every standard-driven task.
- Feedback loop for improving the standard.
- Smoke validation script: `scripts/smoke-standard-scenarios.py`
- MIT License
