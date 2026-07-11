# Test Scenario Report Template: InnoHub Production Read-only

> AKS AI Dev Standard (เดิม BDA AI Dev Standard) template สำหรับ InnoHub QA/product evidence แบบ production read-only. ใช้เป็นแบบฟอร์มรายงานเท่านั้น ไม่ใช่รายงานงานประจำวัน, performance review, score, KPI หรือการประเมินบุคคล

## Summary

- Report title: <InnoHub test scenario title>
- Product/feature: BDA InnoHub — <module/feature>
- Environment: production-read-only / staging / local
- Base URL: https://example.com
- Build/version/commit: <version or commit if known>
- Date/time: <YYYY-MM-DDTHH:mm:ss+07:00>
- Tester/agent/tool: <name/tool>
- Role/account type used: no credentials / production read-only / synthetic test / limited-role
- Test account classification: no credentials / production read-only / synthetic test / limited-role
- Credentials/secrets included in report? no only
- Browser/device/viewport: <browser/device/viewport>
- Data/privacy constraints: no production mutation; mask PII/secret/customer/payment data before sharing
- Status summary: NOT_RUN

## Non-performance confirmation

- [ ] This report is QA/product evidence only
- [ ] This report is not an employee daily report
- [ ] This report is not a performance review, score, KPI, daily performance, or individual evaluation
- [ ] Role/team/account context is only for scenario reproducibility

## Production Read-only Guardrail

- Environment contains production/real data? yes / no / unknown
- Allowed actions: view-only / navigation-only / no submit / no mutation
- Forbidden production actions checked: create / edit / delete / approve / reject / upload / import / export / download sensitive docs
- Explicit scope allows production write action? no only unless separately approved
- Auth/session bypass attempted? no only
- No-mutation/network-write criteria: no POST/PUT/PATCH/DELETE action is intentionally triggered; stop before submit/write/export/download
- Stop condition for PII/write-risk: stop scenario, mark blocked, mask evidence before handoff

## Test account classification

- Account/session used: <no credentials / production read-only / synthetic test / limited-role>
- Authorized by / scope reference, no secret: <ticket/chat/request id or “not provided”>
- Roles/permissions expected: <role or unauthenticated>
- Roles/permissions observed: <observed role/access>
- Credentials/tokens/passwords included? no only
- Limitations from account/session: <limitations>

## Test matrix

- Scenario ID: INNO-TC-001
  - Title: <scenario title>
  - Priority: P0 / P1 / P2 / P3
  - Role/account class: <role/account class>
  - Entry point / menu path: <visible menu path or direct URL label>
  - Route source trace: VISIBLE_MENU / DIRECT_URL_USER / DIRECT_URL_TECHNICAL / SOURCE_CODE_ROUTE / OLD_DOCS_ROUTE / BROWSER_REDIRECT / DEPLOYED_BUNDLE_OBSERVED
  - Status: NOT_RUN
  - No mutation/network write verified? not applicable
  - Severity if issue: none
  - Screenshot evidence: <path or not captured yet>
  - Issue / recommendation: <notes>

## Auth/RBAC matrix

- Role/account class: <unauthenticated / production read-only / limited-role>
  - Route/module/action: <route/module/action>
  - Expected access: allow / deny / redirect / read-only / no-mutation
  - Actual access: <actual behavior>
  - Final URL / deny message: <final URL or message>
  - Evidence screenshot label/path: <path>
  - Console/network summary: <summary>
  - Status / blocked reason: NOT_RUN

## Route Source Trace

- Route/path: <path>
  - Scenario ID: INNO-TC-001
  - Source trace: visible menu / direct URL from user / technical direct URL / source code route / old docs / browser redirect / deployed bundle
  - Visible-menu reachable? yes / no / not checked
  - HTTP status: <status if checked>
  - Final URL: <final URL>
  - App-level result: expected page / app-level SPA 404 / HTTP 404 / redirect to auth / blank page / runtime crash
  - Drift result: ROUTE_OK / ROUTE_MISSING / MENU_DRIFT / DOC_DRIFT / DEPLOY_DRIFT / APP_LEVEL_404 / HTTP_404 / BLANK_OR_CRASH
  - Notes / source files checked: <notes>

## Scenario details

### INNO-TC-001 — <title>

- Objective: <objective>
- Preconditions: <preconditions>
- Test data used, masked: <masked/non-sensitive only>
- Account classification / role: <role/account class>
- Entry point / visible menu path: <path/menu>
- Route source trace: <trace labels>
- Technical verification only? no / yes, reason and standard wording used:
- No-mutation/network-write criteria: <criteria>

#### Steps, expected, actual, evidence

- Step 1:
  - Action: <action>
  - Expected: <expected>
  - Actual: <actual>
  - Status: NOT_RUN
  - Blocked reason if any: <none or taxonomy>
  - Screenshot: <path or not captured yet>
  - Notes: <notes>

#### Console / network / log observations

- Console errors: not checked yet
- Network/API failures: not checked yet
- Network write/mutation requests observed: not checked yet
- HTTP status / final URL / app-level 404: not checked yet
- Server/app logs checked: no / not available

## Evidence Manifest

- File: `evidence/INNO-TC-001-01-placeholder.png`
  - Scenario/step: INNO-TC-001 Step 1 placeholder
  - Page/URL: <URL>
  - Expected/actual shown: placeholder only; replace before final report
  - Console summary: not checked yet
  - Network summary: not checked yet
  - Contains PII/secret/customer/payment data? no
  - Masking applied? not needed
  - Safe to share externally? yes

## Issues and recommendations

- Issue ID: INNO-QA-001
  - Related scenario: INNO-TC-001
  - Severity: none
  - Evidence: not run yet
  - Recommendation: replace placeholder with real execution evidence
  - Suggested next step: execute scenario under approved scope

## BDA Standard files used

- `<path-to-standard>/commands/test-scenario-report.md`
- `<path-to-standard>/workflows/test-scenario-report.md`
- `<path-to-standard>/templates/test-scenario-report.md`
- `<path-to-standard>/templates/test-scenario-report-innohub-production-readonly.md`

## Pipeline trace

- Understand: read task/scope/environment/account constraints
- Guardrail: apply production read-only/no-mutation checklist before executing
- Plan: create test matrix, Auth/RBAC matrix, route source trace, and evidence checkpoints
- Execute: run approved scenarios only; stop on write-risk/PII-risk
- Verify: check report completeness, no secrets, evidence paths/labels, and no-mutation notes
- Handoff: provide report path, validation output, limitations, and next steps

## Commands run

- Not run in template; fill with exact commands during execution

## Verification / Evidence

- Report path: <path>
- Evidence folder: <path>
- Screenshot paths / MEDIA paths with labels: <paths>
- Console/network summary: <summary>
- Route drift / SPA 404 evidence: <evidence>
- Auth/RBAC evidence: <evidence>
- No-mutation/network-write verification: <verification>

## Limitations / Risks / Next steps

- Template placeholders must be replaced before claiming PASS/FAIL
- Do not include credentials, tokens, private endpoint secrets, or unmasked PII
- Use dry-run sync validation before private send
