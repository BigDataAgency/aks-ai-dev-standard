# Changelog

All notable changes to BDA AI Dev Standard are tracked here.

This project uses Semantic Versioning: `MAJOR.MINOR.PATCH`.

- MAJOR: breaking changes to command names, required outputs, or installation layout
- MINOR: new commands, workflows, templates, adapters, or substantial behavior improvements
- PATCH: clarifications, typo fixes, safer wording, and non-breaking documentation updates

## [0.2.0] - 2026-05-17

### Added

- QA/product evidence workflow for test case/scenario execution with screenshot capture and Markdown report generation:
  - `commands/test-scenario-report.md`
  - `workflows/test-scenario-report.md`
  - `templates/test-scenario-report.md`
  - `claude/commands/test-scenario-report.md`
- Smoke validation coverage for the new test scenario report workflow and Claude slash command.

### Notes

- This workflow is explicitly separate from Employee Daily Log v5 and performance evaluation.
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
  - Employee Daily Log v5
  - PM Weekly Focus v2
- Codex adapter: `codex/AGENTS.md`
- Claude adapter and slash-command files: `claude/CLAUDE.md`, `claude/commands/*.md`
- Required reporting trace for every standard-driven task:
  - BDA Standard files used
  - Pipeline trace
  - Commands run
  - Verification / Evidence
  - Limitations / Risks / Next steps
- Feedback loop for improving the standard, separate from Employee v5 and performance evaluation:
  - `FEEDBACK.md`
  - `commands/standard-feedback.md`
  - `templates/standard-feedback.md`
  - `workflows/standard-improvement.md`
- Smoke validation script: `scripts/smoke-standard-scenarios.py`
- MIT License

### Notes

This release is a curated internal-practice standard made public for reuse and feedback. It is not presented as original invention; it combines practical patterns, lessons learned, and open-source-friendly documentation into a versioned workflow standard.
