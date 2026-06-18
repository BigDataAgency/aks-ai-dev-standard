#!/usr/bin/env python3
"""Smoke validation for BDA AI Dev Standard coverage.

This script is intentionally dependency-free and safe: it reads this standard
repo only and writes a temporary sandbox under /tmp for scenario-output checks.
"""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SANDBOX = Path("/tmp/bda-ai-dev-standard-smoke")
EXPECTED_VERSION = "0.10.2"

REQUIRED_SECTIONS = [
    "BDA Standard files used",
    "Pipeline trace",
    "Commands run",
    "Verification / Evidence",
    "Limitations / Risks / Next steps",
]

SCENARIOS = {
    "init": ["commands/init.md", "templates/obsidian-context.md", "templates/obsidian-work-note.md", "workflows/obsidian.md"],
    "bug-fix": ["commands/fix-bug.md", "workflows/bug-fix.md"],
    "review-change": ["commands/review-change.md", "workflows/code-review.md"],
    "write-document": ["commands/write-document.md", "workflows/writing-docs.md"],
    "update-obsidian": ["commands/update-obsidian.md", "workflows/obsidian.md"],
    "performance-review": ["commands/performance-review.md", "workflows/performance.md"],
    "standard-feedback": ["commands/standard-feedback.md", "templates/standard-feedback.md", "workflows/standard-improvement.md", "FEEDBACK.md"],
    "test-scenario-report": ["commands/test-scenario-report.md", "templates/test-scenario-report.md", "workflows/test-scenario-report.md"],
    "test-report": ["commands/test-report.md", "templates/test-scenario-report.md", "workflows/test-scenario-report.md"],
}

GLOBAL_FILES = [
    "STANDARD.md",
    "AI-README.md",
    "README.md",
    "claude/CLAUDE.md",
]

CLAUDE_COMMANDS = [
    "claude/commands/init.md",
    "claude/commands/fix-bug.md",
    "claude/commands/review-change.md",
    "claude/commands/build-feature.md",
    "claude/commands/write-document.md",
    "claude/commands/verify-work.md",
    "claude/commands/standard-feedback.md",
    "claude/commands/test-scenario-report.md",
    "claude/commands/test-report.md",
]

COMMAND_PACK = {
    "test-report": {
        "command": "commands/test-report.md",
        "claude": "claude/commands/test-report.md",
        "template": "templates/test-scenario-report.md",
        "terms": ["Test Report", "QA/product evidence", "screenshot", "test matrix", "expected", "actual"],
    },
}

# Optional adapters: when present, they must point users at normal command names.
OPTIONAL_STAFF_ADAPTER_GLOBS = [
    "staff/**/*.md",
    "gemini/**/*.md",
    "claude-coworker/**/*.md",
]

FORBIDDEN_CLAIMS = [
    r"test(s)? passed(?!.*(if|when|example))",
    r"ตรวจแล้วผ่าน(?!.*(ถ้า|เมื่อ|ตัวอย่าง))",
]


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.exists():
        raise AssertionError(f"missing file: {rel}")
    return path.read_text(encoding="utf-8")


def assert_contains_all(rel: str, terms: list[str]) -> None:
    text = read(rel)
    missing = [term for term in terms if term not in text]
    if missing:
        raise AssertionError(f"{rel} missing required terms: {missing}")


def validate_version_consistency() -> None:
    version = read("VERSION").strip()
    if version != EXPECTED_VERSION:
        raise AssertionError(f"VERSION is {version!r}, expected {EXPECTED_VERSION!r}")

    assert_contains_all("README.md", [f"Version: `{EXPECTED_VERSION}`", f"Current version: `{EXPECTED_VERSION}`"])
    assert_contains_all("CHANGELOG.md", [f"## [{EXPECTED_VERSION}]", "coding discipline", "minimum correct change", "verification maps to success criteria"])


def validate_required_sections() -> None:
    for rel in GLOBAL_FILES:
        assert_contains_all(rel, REQUIRED_SECTIONS)

    for rel in sorted((ROOT / "commands").glob("*.md")):
        assert_contains_all(str(rel.relative_to(ROOT)), REQUIRED_SECTIONS)

    for rel in sorted((ROOT / "workflows").glob("*.md")):
        assert_contains_all(str(rel.relative_to(ROOT)), REQUIRED_SECTIONS)

    for rel in CLAUDE_COMMANDS:
        assert_contains_all(rel, REQUIRED_SECTIONS)


def validate_claude_usage_docs() -> None:
    for rel in ["README.md", "claude/CLAUDE.md"]:
        assert_contains_all(
            rel,
            [
                ".claude/commands/",
                "interactive",
                "claude -p",
                "/init",
                "/fix-bug",
                "/review-change",
                "/standard-feedback",
                "/test-report",
            ],
        )


def validate_obsidian_init_workflow() -> None:
    init_files = [
        "commands/init.md",
        "templates/obsidian-context.md",
        "templates/obsidian-work-note.md",
        "workflows/obsidian.md",
        "claude/commands/init.md",
    ]
    required_terms = [
        "00-Agent-Context.md",
        "sessions/_index.md",
        "test-evidence/_index.md",
        "Obsidian context manifest",
        "pending evidence",
    ]
    for rel in ["commands/init.md", "workflows/obsidian.md", "claude/commands/init.md"]:
        assert_contains_all(rel, [*REQUIRED_SECTIONS, "00-Agent-Context.md"])

    for rel in [
        "README.md",
        "AI-README.md",
        "claude/CLAUDE.md",
        "codex/AGENTS.md",
        "commands/plan-work.md",
        "commands/fix-bug.md",
        "commands/build-feature.md",
        "commands/write-document.md",
        "commands/update-obsidian.md",
    ]:
        assert_contains_all(rel, ["commands/init.md", "00-Agent-Context.md"])

    assert_contains_all("templates/obsidian-context.md", required_terms[:4])
    assert_contains_all("templates/obsidian-work-note.md", ["Testcase / Evidence", "Obsidian updates"])


LEGACY_REMOVED_TERMS = [
    "daily" + "-log",
    "weekly" + "-focus",
    "Daily" + " Log",
    "Weekly" + " Focus",
    "/" + "daily" + "-log",
    "/" + "weekly" + "-focus",
    "employee-" + "daily" + "-log-" + "v" + "5",
    "pm-" + "weekly" + "-focus-" + "v" + "2",
    "daily" + "-log-" + "v" + "5",
    "weekly" + "-focus-" + "v" + "2",
    "Employee " + "v" + "5",
    "PM " + "v" + "2",
    "v" + "5",
    "weekly planning " + "v" + "2",
    "stand" + "alone",
]


def validate_command_pack() -> None:
    for name, spec in COMMAND_PACK.items():
        assert_contains_all(spec["command"], [*REQUIRED_SECTIONS, *spec["terms"], spec["template"]])
        assert_contains_all(spec["claude"], [f"/{name}", spec["command"], *REQUIRED_SECTIONS])

    for rel in ["README.md", "claude/CLAUDE.md"]:
        assert_contains_all(
            rel,
            [
                "commands/test-report.md",
                "/test-report",
            ],
        )


def validate_bda_session_cli() -> None:
    for rel in [
        "docs/bda-session-cli.md",
        "docs/ai-work-event-logging.md",
        "README.md",
        "AI-README.md",
        "claude/CLAUDE.md",
        "codex/AGENTS.md",
        "prompts/general-ai/start-here.md",
    ]:
        assert_contains_all(rel, ["bda start", "bda stop", "bda help", "bda-dev-debug", "bda-nondev-explore", "bda-pm-status"])

    assert_contains_all("package.json", ['"bda": "scripts/bda.mjs"', '"test:bda-session"'])
    assert_contains_all("scripts/bda.mjs", ["bda start", "bda event", "bda stop", "outbox", "BDA_AI_WORK_EVENT_URL"])
    assert_contains_all("scripts/test-bda-session.mjs", ["bda session CLI smoke test passed"])


def validate_optional_adapters() -> None:
    adapter_paths: list[Path] = []
    for pattern in OPTIONAL_STAFF_ADAPTER_GLOBS:
        adapter_paths.extend(ROOT.glob(pattern))

    for path in sorted(set(adapter_paths)):
        rel = str(path.relative_to(ROOT))
        if path.name == "README.md":
            assert_contains_all(rel, ["test-report"])
        elif path.stem in COMMAND_PACK:
            assert_contains_all(rel, [path.stem, COMMAND_PACK[path.stem]["command"]])


def validate_legacy_staff_versioning_removed() -> None:
    removed_files = [
        "commands/" + "daily" + "-log.md",
        "commands/" + "weekly" + "-focus.md",
        "templates/" + "daily" + "-log.md",
        "templates/" + "weekly" + "-focus.md",
        "claude/commands/" + "daily" + "-log.md",
        "claude/commands/" + "weekly" + "-focus.md",
        "staff/commands/" + "daily" + "-log.md",
        "staff/commands/" + "weekly" + "-focus.md",
        "gemini/prompts/" + "daily" + "-log.md",
        "gemini/prompts/" + "weekly" + "-focus.md",
        "claude-coworker/prompts/" + "daily" + "-log.md",
        "claude-coworker/prompts/" + "weekly" + "-focus.md",
        "commands/employee-" + "daily" + "-log-" + "v" + "5.md",
        "commands/pm-" + "weekly" + "-focus-" + "v" + "2.md",
        "templates/" + "daily" + "-log-" + "v" + "5.md",
        "templates/pm-" + "weekly" + "-focus-" + "v" + "2.md",
        "claude/commands/employee-" + "daily" + "-log-" + "v" + "5.md",
        "claude/commands/pm-" + "weekly" + "-focus-" + "v" + "2.md",
    ]
    existing = [rel for rel in removed_files if (ROOT / rel).exists()]
    if existing:
        raise AssertionError(f"legacy versioned files still exist: {existing}")

    for path in ROOT.glob("**/*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        if path.suffix not in {".md", ".py", ".toml", ".json", ".txt"} and path.name not in {"VERSION"}:
            continue
        rel = str(path.relative_to(ROOT))
        if rel == "scripts/smoke-standard-scenarios.py":
            continue
        text = path.read_text(encoding="utf-8")
        found = [term for term in LEGACY_REMOVED_TERMS if term in text]
        if found:
            raise AssertionError(f"{rel} still contains removed daily/weekly terms: {found}")


def validate_standard_feedback_loop() -> None:
    feedback_files = [
        "FEEDBACK.md",
        "commands/standard-feedback.md",
        "templates/standard-feedback.md",
        "workflows/standard-improvement.md",
        "claude/commands/standard-feedback.md",
    ]
    required_terms = [
        "BDA AI Dev Standard",
        "performance",
        "ไม่ใช่",
    ]
    for rel in feedback_files:
        assert_contains_all(rel, required_terms)

    assert_contains_all(
        "templates/standard-feedback.md",
        [
            "Tool used",
            "Command or workflow used",
            "Expected behavior",
            "Actual behavior / friction",
            "Suggested improvement",
            "Non-performance confirmation",
        ],
    )

    assert_contains_all(
        "README.md",
        [
            "FEEDBACK.md",
            "commands/standard-feedback.md",
            "templates/standard-feedback.md",
            "workflows/standard-improvement.md",
            "ไม่ใช่ทุกทีม/ทุก role ใช้มาตรฐานนี้",
        ],
    )


def validate_test_scenario_report_workflow() -> None:
    scenario_files = [
        "commands/test-scenario-report.md",
        "workflows/test-scenario-report.md",
        "templates/test-scenario-report.md",
        "claude/commands/test-scenario-report.md",
    ]
    required_terms = [
        "QA/product evidence",
        "screenshot",
        "test matrix",
        "expected",
        "actual",
        "console",
        "severity",
        "recommendations",
        "visible-menu navigation",
        "technical verification only",
        "performance",
    ]
    for rel in scenario_files:
        assert_contains_all(rel, required_terms)

    assert_contains_all(
        "templates/test-scenario-report.md",
        [
            "PASS / FAIL",
            "BLOCKED",
            "NOT_RUN",
            "MEDIA:/absolute/path/to",
            "Console errors",
            "Network/API failures",
            "Non-performance confirmation",
        ],
    )

    assert_contains_all(
        "README.md",
        [
            "commands/test-scenario-report.md",
            "workflows/test-scenario-report.md",
            "templates/test-scenario-report.md",
            "claude/commands/test-report.md",
            "visible-menu navigation",
            "technical verification only",
        ],
    )


def validate_scenario_templates() -> None:
    if SANDBOX.exists():
        shutil.rmtree(SANDBOX)
    SANDBOX.mkdir(parents=True)

    for name, bda_files in SCENARIOS.items():
        for rel in bda_files:
            if not (ROOT / rel).exists():
                raise AssertionError(f"scenario {name} references missing file: {rel}")

        report = f"""# Smoke scenario: {name}

## BDA Standard files used
- STANDARD.md
""" + "\n".join(f"- {rel}" for rel in bda_files) + f"""

## Pipeline trace
- Understand: read scenario context and {bda_files[0]}
- Plan: choose applicable workflow/template
- Execute: no production write; generated smoke report only
- Verify: checked required sections exist
- Handoff: report created in sandbox

## Commands run
- python3 scripts/smoke-standard-scenarios.py (current validation)

## Verification / Evidence
- Required sections present for {name}
- Referenced BDA files exist

## Limitations / Risks / Next steps
- Smoke validation only; it does not run real project tests
"""
        out = SANDBOX / f"{name}.md"
        out.write_text(report, encoding="utf-8")
        generated = out.read_text(encoding="utf-8")
        missing = [section for section in REQUIRED_SECTIONS if section not in generated]
        if missing:
            raise AssertionError(f"generated scenario {name} missing: {missing}")


def validate_no_forbidden_claims() -> None:
    paths = list(ROOT.glob("**/*.md"))
    ignored_parts = {".git"}
    for path in paths:
        if ignored_parts & set(path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        for pattern in FORBIDDEN_CLAIMS:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                raise AssertionError(f"potential unsupported pass claim in {path.relative_to(ROOT)}: {match.group(0)!r}")


def main() -> int:
    checks = [
        validate_version_consistency,
        validate_required_sections,
        validate_claude_usage_docs,
        validate_command_pack,
        validate_bda_session_cli,
        validate_optional_adapters,
        validate_legacy_staff_versioning_removed,
        validate_obsidian_init_workflow,
        validate_standard_feedback_loop,
        validate_test_scenario_report_workflow,
        validate_scenario_templates,
        validate_no_forbidden_claims,
    ]
    for check in checks:
        check()
        print(f"PASS {check.__name__}")
    print(f"PASS scenarios: {', '.join(SCENARIOS)}")
    print(f"Sandbox reports: {SANDBOX}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        raise SystemExit(1)
