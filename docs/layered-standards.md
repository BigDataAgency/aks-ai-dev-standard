# Existing project schemas and reporting trace

## Precedence

Use the project’s existing schema, validation, and storage contract when updating an established artifact. The general operating standard adds an evidence/reporting layer; it does not authorize replacing a project format or silently migrating existing data.

Follow the project’s documented requirements for its artifact. Preserve applicable security, approval and evidence requirements from both layers. If requirements conflict in a way that changes data, permissions or correctness, record the conflict and obtain the responsible owner’s decision before changing that contract.

## Pre-existing project schemas

Before changing a saved report, identify the schema/version used by its consumers and read an existing example. Preserve required fields, identifiers, meanings and units. Do not overwrite existing reports, remove fields, reinterpret values or introduce a schema migration merely to match a generic template.

If an existing format allows additional sections, append the required reporting trace without altering its original content. If its parser/schema does not allow them, keep the project artifact unchanged and save a linked companion report with all five standard reporting sections. The companion must identify the original artifact and its revision; do not claim compliance from a report that was never saved.

## Dual-compliant example

A project stores work records as a CSV with `date,project,hours,notes`. Adding Markdown headings inside that CSV would break its consumer. Keep that format and its values, then save a companion Markdown report such as:

```markdown
# Verification of work-record.csv
Source artifact: work-record.csv at the exact revision being checked

## BDA Standard files used
- STANDARD.md
- docs/layered-standards.md
## Pipeline trace
- Understand / Plan / Execute / Verify / Handoff: record actual steps
## Commands run
- List only commands actually run
## Verification / Evidence
- Record the schema check and its actual result; mark untested parts explicitly
## Limitations / Risks / Next steps
- No schema migration; state remaining checks and their responsible owner
```

These are example placeholders, not evidence of a completed check. Acceptance requires the existing consumer still reads the original artifact and the saved companion identifies that same revision.

## Retired workflows

The public staff operational reporting/planning commands and related templates were removed in version0.7.0, as recorded in CHANGELOG.md. This guidance does not restore them or instruct employees to use removed commands. Existing project data remains governed by the project contract; changing an installed workflow requires its own rollout evidence and applicable approval.
