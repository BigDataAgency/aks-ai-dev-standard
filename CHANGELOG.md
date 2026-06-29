# Changelog

All notable changes to BDA AI Dev Standard are tracked here.

This project uses Semantic Versioning: `MAJOR.MINOR.PATCH`.

- MAJOR: breaking changes to command names, required outputs, or installation layout
- MINOR: new commands, workflows, templates, adapters, or substantial behavior improvements
- PATCH: clarifications, typo fixes, safer wording, and non-breaking documentation updates

## [0.11.6] - 2026-06-29

### Added

- Added `bda hermes-light-mode --yes` to archive unused Hermes skill cache and prompt snapshots while keeping the BDA standard skill metadata, app, keys, config, and chat state intact.
- The employee installer now runs Hermes light mode after config cleanup so new installs do not carry a large unused skill catalogue into every request.

### Changed

- `bda doctor` now reports Hermes skill cache summary and recommends light mode when the local skill catalogue is larger than the BDA standard needs.

## [0.11.5] - 2026-06-29

### Added

- Added `bda_inventory` reporting from `bda update` and `bda doctor` so AdminA40/Grafana can distinguish the last installer package from the current installed CLI/standard version.

### Fixed

- Prevented AdminA40 install status from looking stale after a successful `bda update`; dashboards can now use the latest inventory event for current version and keep installer version as a separate audit field.

## [0.11.4] - 2026-06-29

### Added

- Added `scripts/install-bda-standard.mjs`, a cross-platform employee installer that installs the latest standard, writes private employee config from an external file, updates `bda` wrappers, cleans Hermes model config, and runs `bda doctor`.
- Added installer safeguards so public code never embeds employee keys and installer output redacts API keys by fingerprint.

## [0.11.3] - 2026-06-29

### Fixed

- Clarified `bda help` so employees can clearly separate terminal commands from chat-only prompt prefixes and model names.

## [0.11.2] - 2026-06-29

### Added

- Added `bda doctor` so employees can inspect BDA config, active session state, Hermes hidden context size, and local request dumps without exposing keys or prompt content.
- Added `bda doctor --fix`, `bda hermes-reset`, and `bda hermes-clean-context --yes` to archive stale Hermes state safely while preserving `config.yaml`, `.env`, and BDA employee config.
- Added Hermes state diagnostics for `~/.hermes`, macOS Application Support paths, Windows LocalAppData/Roaming paths, request dump counts, and large-context warning thresholds.
- Added a hard safety guard so Hermes cleanup refuses to archive whole Hermes app/profile roots such as `~/Library/Application Support/Hermes`, `~/.hermes`, or `/Applications/Hermes.app`.

### Fixed

- Prevented repeats of the Earn/Non incident where `bda current` was inactive but Hermes still carried large hidden chat/tool context into new `bda/dev` requests.
- Standardized the cleanup command names used by the safe-context installer and the public standard CLI to reduce command drift during rollout.

## [0.11.1] - 2026-06-25

### Fixed

- Synced local session ids from the gateway response when the server deduplicates a repeated `bda start`, preventing duplicate admin sessions and split spend tracking.
- Documented the LiteLLM key/team permission chain for hidden A40 node aliases and added an idempotent SQL sync script for `bda/dev-a40-1-local` / `bda/dev-a40-2-local`.
- Added an internal staff permission sync script so non-dev/PM keys are not left on a DeepSeek-only allow list when hybrid routing sends them to Qwen paid fallback or A40 aliases.

### Added

- Added `bda/nondev` to the BDA Gateway model catalog as the employee-facing nondev/document/summary lane, backed by OpenRouter DeepSeek v4 Flash.
- Added `docs/local-llm-product-learning-log.md` to preserve product lessons from Local LLM/A40/hybrid rollout incidents and usage patterns.
- Kept the public repo as the source of truth for `bda help` and `bda update` guidance while carrying forward the 0.10.x hotfix line.

### Changed

- `bda update` / `bda config-clean` now preserve `bda/nondev` and `bda/deepseek-v4-pro-paid-cloud` in generated Hermes model lists.
- The internal staff LiteLLM permission sync now includes `bda/nondev` and `bda/deepseek-v4-pro-paid-cloud` so nondev/PM staff do not hit 401 after model catalog changes.

## [0.10.20] - 2026-06-25

### Fixed

- `bda start`, `bda current`, and `bda stop` now use `~/.bda-skills/current-session.json` by default instead of the current working directory. This prevents duplicate active sessions when Hermes starts a session from inside the standard repo but staff run `bda current` from their home or project directory.
- `bda current` now migrates an active legacy session file from `./.bda-skills/current-session.json` or the installed standard repo into `~/.bda-skills/current-session.json`, then renames the legacy file so later commands see one active session consistently.

## [0.10.19] - 2026-06-25

### Fixed

- `bda update`, `bda config-clean`, and `bda config-status` now keep required BDA compatibility models such as `bda/deepseek-fast-paid-cloud` and `bda/deepseek-paid-cloud` even if the live gateway `/v1/models` response is temporarily missing them. This prevents Hermes config from losing nondev/paid compatibility models during gateway rollout changes.

## [0.10.18] - 2026-06-24

### Fixed

- Fixed `bda update` on Windows when the CLI is launched from a `file:///C:/...` path. The updater now resolves its own script path with Node's `fileURLToPath`, preventing invalid clone targets such as `C:\C:\Users\...\ .bda-ai-dev-standard`.
- Replaced the shell-only `rm -rf` cleanup path with Node's cross-platform `fs.rmSync` before cloning a missing standard repo.
- Clarified the missing-git update hint: employees should not reinstall BDA themselves and should send the error plus command path evidence to lead/admin.

## [0.10.17] - 2026-06-23

### Fixed

- Hotfixed `bda update` model sync after the 0.10.16 stale model regression: generated Hermes/thClaws configs now follow the current Gateway list with `bda/qwable-27b-local` and `bda/qwythos-9b-local`, not retired `auto-default/free-fast/qwen3.6` local aliases.
- Updated local model context metadata for Qwable/Qwythos so thClaws and Hermes show the current lanes after update.

## [0.10.16] - 2026-06-23

### Fixed

- `bda update`, `bda config-clean`, and `bda config-status` now read the current BDA Gateway `/v1/models` list before rewriting Hermes config, instead of using a stale hand-written model list.
- Synced thClaws `openai-compat` model catalogue from BDA Gateway when thClaws is installed, so pilot users do not see stale model rows.
- Restored current local model names `bda/qwable-27b-local` and `bda/qwythos-9b-local`; removed stale `auto-default/free-fast/qwen3.6` generated client entries.

## [0.10.15] - 2026-06-23

### Fixed

- `bda config-clean` now removes Hermes `ollama_cloud_models_cache.json` in addition to provider/model caches, so stale model picker entries from the old BDA group do not survive a restart.

## [0.10.14] - 2026-06-22

### Changed

- Renamed employee-facing local models to their real model lanes: `bda/qwable-27b-local` and `bda/qwythos-9b-local`.
- Removed local model auto-routing from the employee-facing config so testing a selected model is direct.

## [0.10.13] - 2026-06-22

### Fixed

- Restored paid cloud models in Hermes config while keeping `bda/dev-local` and `bda/nondev-local` as the primary local choices.
- Kept removed experimental models out of the picker: GPT-OSS and Kimi are still not included.

## [0.10.12] - 2026-06-22

### Changed

- Reduced Hermes BDA model config to two employee-facing choices: `bda/nondev-local` and `bda/dev-local`.
- Set `bda/dev-local` as the default coding lane and `bda/nondev-local` as the compression/long-reading lane.
- Removed paid/cloud and legacy local aliases from employee Hermes config so the picker no longer exposes stale model groups.

## [0.10.11] - 2026-06-22

### Removed

- Removed `bda/gpt-oss-20b-local` and `bda/kimi-k2.7-code-paid-cloud` from Hermes config because they are not part of the current production model set.

## [0.10.10] - 2026-06-22

### Added

- Added `bda/kimi-k2.7-code-paid-cloud` to Hermes config as a paid cloud model backed by Kimi/Moonshot, with a 262K context declaration. The model remains opt-in and is not the default.

## [0.10.9] - 2026-06-22

### Fixed

- Restored `bda/gpt-oss-20b-local` in Hermes model config as an intentional optional model.
- Declared a Hermes-visible `context_length: 65536` for GPT-OSS so Hermes Agent initialization does not fail the 64K minimum check. Treat GPT-OSS as a short-context/test lane until gateway serving is validated for longer work.

## [0.10.8] - 2026-06-22

### Fixed

- Removed `bda/gpt-oss-20b-local` from Hermes model config because its 32K context is below Hermes Agent's 64K minimum and can prevent agent initialization.
- Superseded by 0.10.9, which restores GPT-OSS with a Hermes-safe context declaration.

## [0.10.7] - 2026-06-22

### Fixed

- Added `bda config-clean` as an explicit Hermes provider/model cleanup command for incident response.
- Added macOS/Windows Hermes config/cache path variants so cleanup catches more desktop installs.
- `bda update` can call the freshly updated CLI to run cleanup after pulling a newer standard release.
- Documented the fallback flow for Hermes still showing two BDA model groups after update.

## [0.10.6] - 2026-06-22

### Fixed

- `bda update` now cleans Hermes BDA provider/model config during update.
- Removes legacy BDA custom provider entries that made Hermes show duplicate groups (`BDA` and `BDA AI GATEWAY`).
- Clears Hermes model/provider caches so the picker rebuilds after restart.
- Removes stale BDA model aliases that should no longer be offered from the employee config.

## [0.10.5] - 2026-06-22

### Added

- Added `bda update` so employee machines can refresh BDA AI Dev Standard without receiving a new full installer zip.
- Added dry-run smoke coverage for `bda update`.

### Changed

- `bda update` uses git fetch/reset/clean on the local standard repo, so dirty local edits from older installers do not block standard updates.
- Documented update-only rollout as the default path for command/session fixes after the first install.

## [0.10.4] - 2026-06-22

### Changed

- Reduced the Hermes employee-facing BDA command catalog to `bda-dev`, `bda-nondev`, and `bda-pm` so local models do not waste context on many near-duplicate workflow commands.
- Moved detailed activity classification into `work_type` such as `debug`, `review`, `test`, `documentation`, `pm-status`, and `risk`.
- Kept legacy command aliases such as `bda-dev-debug` and `bda-pm-status` accepted by the CLI for migration, but they are no longer shown in employee help.

### Fixed

- Prevented local/Hermes prompts from exposing the long dev plan command family, which caused confusion and unnecessary context pressure.

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
