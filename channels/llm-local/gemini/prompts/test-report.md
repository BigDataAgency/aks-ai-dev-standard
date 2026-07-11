# Gemini Prompt Command: Test Report

This is a prompt command, not a Claude Code slash command.

## Copy/paste prompt

```text
Use AKS AI Dev Standard (เดิม BDA AI Dev Standard) current command `test-report`.
Read/reference `core/commands/test-report.md`. Treat `core/commands/test-scenario-report.md` as the source of truth and `core/templates/test-scenario-report.md` as the output template where applicable.

Guardrail: Use QA/product evidence behavior from the test-scenario-report standard; not performance evaluation.

Context:
<วาง context งานจริงที่นี่>

Required output sections: BDA Standard files used, Pipeline trace, Commands run, Verification / Evidence, Limitations / Risks / Next steps.
If a command/tool/test was not run, say it was not run and why. Do not claim evidence that is not present.
```

## Adapter note

Use this file as a paste/reference prompt for Gemini. Slash commands such as `/test-report` are Claude Code interactive only.
