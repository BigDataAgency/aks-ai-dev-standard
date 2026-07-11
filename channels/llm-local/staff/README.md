# Staff Command Pack — AKS AI Dev Standard (เดิม BDA AI Dev Standard)

Staff should use normal command names without legacy version suffixes.

## Commands

- `test-report` — QA/product test evidence

## Adapter usage

- Claude Code: slash commands are available only in interactive Claude Code after copying `channels/llm-local/claude/commands/*.md` to `.claude/commands/`. Use `/test-report` for QA/product evidence reports.
- Gemini: use prompt command files in `channels/llm-local/gemini/prompts/`; do not use slash-command syntax as if it were Claude Code.
- Claude coworker: use prompt command files in `channels/llm-local/claude-coworker/prompts/`; these are paste/reference prompts.
- Codex: use `channels/llm-local/codex-local/AGENTS.md` as agent instruction and reference `core/commands/test-report.md`.

## Guardrails

- No fake evidence: missing commit/link/output/test/log/screenshot must be marked pending evidence.
- Test Report is QA/product evidence, not individual performance evaluation.

## Required BDA output sections

Every command output must include: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps.
